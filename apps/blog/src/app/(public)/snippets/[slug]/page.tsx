import { Button } from '@shadcn/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next/types'
import React from 'react'

import { Page, PageHeading, PageSection } from '@/components/page'
import { SnippetView } from '@/components/snippet-view'
import config from '@/data/config.json'
import snippets from '@/data/snippets.json'
import { getSnippetBySlug } from '@/lib/snippets'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return snippets.map((file) => ({
    slug: file.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const snippet = getSnippetBySlug(slug)

  const title = `${snippet.title} | Snippets`
  const description = snippet.description
  const url = `${config.baseUrl}/snippets/${snippet.slug}`

  const ogImageUrl = `${config.baseUrl}/og?title=${encodeURIComponent(snippet.title)}&description=${encodeURIComponent(snippet.description)}`

  return {
    title,
    description,
    keywords: [snippet.language, 'code snippet', snippet.title.toLowerCase()],
    authors: [{ name: config.author, url: config.baseUrl }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      locale: 'en_US',
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImageUrl }],
      creator: '@moatorres',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function SnippetPage({ params }: Props) {
  const { slug } = await params
  const snippet = getSnippetBySlug(slug)

  return (
    <>
      {snippet && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareSourceCode',
              name: snippet.title,
              description: snippet.description,
              programmingLanguage: snippet.language,
              codeSampleType: 'full (compiled)',
              url: `${config.baseUrl}/snippets/${snippet.slug}`,
              author: {
                '@type': 'Person',
                name: 'Moa Torres',
                url: config.baseUrl,
              },
              dateCreated: new Date(snippet.createdAt).toISOString(),
            }),
          }}
        />
      )}

      <Page>
        <PageSection>
          <PageHeading>{snippet.title}</PageHeading>

          <SnippetView data={snippet} />

          <div className="mt-4">
            <Link href="/snippets">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to snippets
              </Button>
            </Link>
          </div>
        </PageSection>
      </Page>
    </>
  )
}
