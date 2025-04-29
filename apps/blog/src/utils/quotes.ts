import categories from '@/assets/json/categories.json'
import quotes from '@/assets/json/quotes.json'

import { baseUrl } from './config'
import { memoize } from './memoize'

export { categories }

export type Quote = {
  author: string
  text: string
}

export type Category = keyof typeof categories

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
  const response = await fetch(`${baseUrl}/api/quotes?subject=${subject}`)
  const quote = (await response.json()) as Quote
  return { quote }
}
