/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { Metadata } from 'next'

import { PageHeading } from '@/components/page'

import { Snippet, SnippetsTable } from './snippets-table'

export const metadata: Metadata = {
  title: 'Snippets',
  description: 'Code snippets in multiple languages and frameworks.',
}

const snippets: Snippet[] = [
  {
    id: '1',
    title: 'Effect CLI',
    published: false,
    language: 'typescript',
    createdAt: '2023-06-15',
  },
  {
    id: '2',
    title: 'BiomeJS',
    published: false,
    language: 'typescript',
    createdAt: '2023-07-22',
  },
  {
    id: '3',
    title: 'Actix WEB',
    published: false,
    language: 'typescript',
    createdAt: '2023-08-05',
  },
  {
    id: '4',
    title: 'Tsyringe',
    published: false,
    language: 'typescript',
    createdAt: '2023-09-12',
  },
  {
    id: '5',
    title: 'Tokio',
    published: true,
    language: 'go',
    createdAt: '2023-10-18',
  },
  {
    id: '6',
    title: 'Crayon',
    published: true,
    language: 'go',
    createdAt: '2023-11-02',
  },
  {
    id: '7',
    title: 'Commander',
    published: false,
    language: 'typescript',
    createdAt: '2023-11-29',
  },
  {
    id: '8',
    title: 'Docker Compose',
    published: false,
    language: 'typescript',
    createdAt: '2023-12-10',
  },
  {
    id: '9',
    title: 'GCP Group',
    published: false,
    language: 'typescript',
    createdAt: '2024-01-05',
  },
  {
    id: '10',
    title: 'Gateway API',
    published: true,
    language: 'go',
    createdAt: '2024-01-18',
  },
]

export default function SnippetsPage() {
  return (
    <div className="@container/page flex flex-1 flex-col gap-8 px-6 py-1">
      <PageHeading className="mb-0">Snippets</PageHeading>
      <SnippetsTable data={snippets} />
    </div>
  )
}
