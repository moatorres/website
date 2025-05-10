/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { memoize } from '@blog/utils'

import categories from '@/assets/json/categories.json'
import quotes from '@/assets/json/quotes.json'
import config from '@/data/config.json'

export { categories }

export type Quote = {
  id: string
  text: string
  author: string
  category: string
}

export type Category = keyof typeof categories | 'random'

export const getCollections = memoize(() => {
  const collections: Record<string, Set<Quote>> = {}

  for (const quote of quotes) {
    const text = quote.text.toLowerCase()
    let matched = false

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        if (!collections[category]) collections[category] = new Set()
        collections[category].add(quote)
        matched = true
        break
      }
    }

    const uncategorized = collections['uncategorized']

    if (!matched && typeof uncategorized !== 'undefined') {
      uncategorized.add(quote)
    } else {
      collections['uncategorized'] = new Set()
    }
  }

  return collections
})

let previousQuote: Quote | null = null

export function getRandomQuote(category: Category): Quote {
  const collections = getCollections()
  const pool = Array.from(collections[category] ?? [])
  const entries = pool.length > 0 ? pool : quotes

  let randomQuote: Quote
  do {
    randomQuote = entries[Math.floor(Math.random() * entries.length)]
  } while (entries.length > 1 && randomQuote === previousQuote)

  previousQuote = randomQuote
  return randomQuote
}

export async function fetchQuoteBySubject(subject?: Category) {
  const response = await fetch(
    `${config.baseUrl}/api/quotes?subject=${subject}`
  )
  const quote = (await response.json()) as Quote
  return { quote }
}

export const getCategoryDescription = memoize((subject: Category) => {
  const descriptions = new Map<Category, string>([
    ['business', 'Quotes about work, leadership, and business topics.'],
    ['creativity', 'Quotes about art, ideas, and creative thinking.'],
    ['friendship', 'Quotes about relationships and interpersonal connection.'],
    ['inspiration', 'Quotes meant to encourage or uplift.'],
    ['life', 'Quotes about everyday experiences and human behavior.'],
    ['love', 'Quotes about romantic and emotional relationships.'],
    ['wisdom', 'Quotes that express general knowledge or life principles.'],
  ])

  return descriptions.get(subject)
})
