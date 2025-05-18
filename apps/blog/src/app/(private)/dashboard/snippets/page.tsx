/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { Metadata } from 'next'

import { PageHeading } from '@/components/page'
import snippets from '@/data/snippets.json'

import { SnippetsTable } from './snippets-table'

export const metadata: Metadata = {
  title: 'Snippets',
  description: 'Code snippets in multiple languages and frameworks.',
}

export default function SnippetsPage() {
  return (
    <div className="@container/page flex flex-1 flex-col gap-8 px-6 py-1">
      <PageHeading className="mb-0">Snippets</PageHeading>
      <SnippetsTable data={snippets} />
    </div>
  )
}
