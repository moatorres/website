import { memoize } from '@blog/utils'

import snippets from '@/data/snippets.json'

export const getSnippets = memoize(() => snippets)

export type Snippet = (typeof snippets)[number]

export function getSnippetById(id: string) {
  const snippet = getSnippets().find((snippet) => snippet.id === id)
  if (!snippet) {
    throw new Error(`Snippet not found: ${id}`)
  }
  return snippet
}

export function getSnippetBySlug(slug: string) {
  const snippet = getSnippets().find((snippet) => snippet.slug === slug)
  if (!snippet) {
    throw new Error(`Snippet not found: ${slug}`)
  }
  return snippet
}
