/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

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
} from '@/utils/quotes'

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
  const description = getCategoryDescription(subject)
  const title = !subject ? 'Quotes' : `${capitalize(subject)} Quotes`

  return {
    description: description,
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
    openGraph: {
      description,
      images: `${config.baseUrl}/images/photos/1df9b2ff-3671-440c-8142-2426bc001985.webp`,
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
