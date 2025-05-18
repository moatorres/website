'use client'

import { memoize } from '@blog/utils'

import snippets from '@/data/snippets.json'

import type { NewSnippet, Snippet as UserSnippet } from './types'

const STORAGE_KEY = 'code-snippets'

export async function getUserSnippets(): Promise<Snippet[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (typeof window === 'undefined') return []

  const snippetsJson = localStorage.getItem(STORAGE_KEY)
  if (!snippetsJson) return []

  try {
    return JSON.parse(snippetsJson)
  } catch (error) {
    console.error('Failed to parse snippets from localStorage:', error)
    return []
  }
}

export async function getSnippet(id: string): Promise<Snippet | null> {
  const snippets = await getUserSnippets()
  return snippets.find((snippet) => snippet.id === id) || null
}

export async function saveSnippet(snippet: NewSnippet): Promise<string> {
  const snippets = await getUserSnippets()

  const id = crypto.randomUUID()
  const newSnippet: UserSnippet = {
    ...snippet,
    id,
  }

  const updatedSnippets = [...snippets, newSnippet]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSnippets))

  return id
}

export async function deleteSnippet(id: string): Promise<void> {
  const snippets = await getUserSnippets()
  const updatedSnippets = snippets.filter((snippet) => snippet.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSnippets))
}

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
