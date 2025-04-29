import { Metadata } from 'next/types'

import { QuoteDisplay } from '@/components/quote-display'
import { config } from '@/utils/config'
import { categories, Category, getRandomQuote } from '@/utils/quotes'

type Props = {
  searchParams: Promise<{ subject: string }>
}

export async function generateStaticParams() {
  return Object.keys(categories).map((key) => ({
    subject: key,
  }))
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { subject } = await searchParams
  const description = `Curated random ${subject} quotes.`
  const title = !subject
    ? 'Quotes'
    : `${subject.slice(0, 1).toUpperCase() + subject.slice(1)} Quotes`

  return {
    description: description,
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
    openGraph: {
      description,
      images: '/images/wave-by-moa-torres.png',
    },
    publisher: config.author,
    referrer: 'origin-when-cross-origin',
    title,
  }
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject: Category }>
}) {
  const { subject } = await searchParams
  const quote = getRandomQuote(subject)

  return (
    <main className="flex-1 px-4 md:px-6 py-12 md:py-16">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Quotation',
            about: subject,
            description: quote.text,
            url: `${config.previewUrl}/quotes${subject}`,
            author: {
              '@type': 'Person',
              name: quote.author,
            },
          }),
        }}
      />

      <h1 className="text-2xl font-medium mb-6">Quotes</h1>

      <QuoteDisplay subject={subject} quote={quote} />
    </main>
  )
}
