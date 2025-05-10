import { Metadata } from 'next'

import quotes from '@/assets/json/quotes.json'
import { PageHeading } from '@/components/page'

import { QuotesTable } from './quotes-table'

export const metadata: Metadata = {
  title: 'Quotes',
  description: 'Set of curated quotes.',
}

export default function QuotesPage() {
  return (
    <div className="@container/page flex flex-1 flex-col gap-8 px-6 py-1">
      <PageHeading className="mb-0">Quotes</PageHeading>
      <QuotesTable data={quotes} />
    </div>
  )
}
