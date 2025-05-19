import { capitalize } from '@blog/utils'
import { Metadata } from 'next/types'
import React from 'react'

import { Page, PageHeading, PageSection } from '@/components/page'
import { QuoteDisplay } from '@/components/quote-display'
import config from '@/data/config.json'
import {
  categories,
  Category,
  getCategoryDescription,
  getRandomQuote,
} from '@/lib/quotes'

type Props = {
  searchParams: Promise<{ subject: Category }>
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
  const title = subject ? `${capitalize(subject)} Quotes` : 'Quotes'
  const description =
    getCategoryDescription(subject) ??
    'Explore a curated collection of thought-provoking, inspiring, and timeless quotes.'
  const ogImageUrl = `/og?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`
  const url = `${config.baseUrl}/quotes${subject ? `?subject=${subject}` : ''}`

  return {
    title,
    description,
    keywords: subject ? ['quotes', subject] : ['quotes', 'inspiration'],
    authors: [{ name: config.author, url: config.baseUrl }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url: url,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: ogImageUrl,
          alt: `${title} – Open Graph image`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@moatorres',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject: Category }>
}) {
  const { subject } = await searchParams
  const quote = getRandomQuote(subject)
  const url = new URL(
    `${config.baseUrl}/quotes` + `${subject ? `?subject=${subject}` : ''}`
  )

  return (
    <Page>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Quotation',
            about: subject ?? 'General',
            description: quote.text,
            url: url.toString(),
            author: {
              '@type': 'Person',
              name: quote.author,
            },
          }),
        }}
      />

      <PageSection>
        <PageHeading>Quotes</PageHeading>
        <QuoteDisplay subject={subject} quote={quote} />
      </PageSection>
    </Page>
  )
}
