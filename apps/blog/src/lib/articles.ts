import { readFileSync } from 'fs'
import { join } from 'path'

import { memoize } from '@blog/utils'

import articles from '@/data/articles.json'
import config from '@/data/config.json'

export type ContentMetadata = {
  author: string
  category: string
  date: string
  description: string
  tags?: string[]
  title: string
}

export type ArticleMetadata = ContentMetadata & {
  id: string
  slug: string
  href: string
  readTime: string
  fileName: string
  filePath: string
  collection: string
  createdAt: string
  publishedAt: string
  updatedAt: string
  content?: {
    mdx?: string
    html?: string
  }
}

/**
 * Retrieves and parses the list of article metadata from a JSON file.
 * @throws {Error} If the file cannot be read or the content is not valid JSON.
 */
export const getArticles = memoize(() => articles)

/**
 * Returns the three latest articles sorted by date in descending order.
 */
export const getLatestArticles = memoize(() => {
  return getArticles()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
})

/**
 * Retrieves a single article by its slug.
 * @throws {Error} If no article is found for the provided slug.
 */
export const getArticleBySlug = memoize((slug: string) => {
  const article = getArticles().find((article) => article.slug === slug)
  if (!article) {
    throw new Error(`Article not found: ${slug}`)
  }
  return article
})

/**
 * Retrieves a collection of articles by its name.
 * @throws {Error} If the collection file cannot be read or the content is not valid JSON.
 */
export const getCollectionByName = memoize((collection: string) => {
  const filePath = join(
    config.metadataDirectory,
    `${collection}.collection.json`
  )
  const fileContent = readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContent) as ArticleMetadata[]
})

/**
 * Retrieves a collection of articles by its name asynchronously.
 * @throws {Error} If the collection file cannot be read or the content is not valid JSON.
 */
export const getCollectionByNameAsync = memoize(
  async (collection: string): Promise<ArticleMetadata[]> => {
    return await import(`@/data/${collection}.collection.json`).then(
      (module) => module.default
    )
  }
)

/**
 * Retrieves a collection of articles by its name and returns their slugs.
 * @throws {Error} If the collection file cannot be read or the content is not valid JSON.
 */
export const getCollectionSlugs = memoize((collection: string) => {
  const collectionMetadata = getCollectionByName(collection)
  return collectionMetadata.map((article) => article.slug)
})

/**
 * Retrieves a collection of articles by its name asynchronously and returns their slugs.
 * @throws {Error} If the collection file cannot be read or the content is not valid JSON.
 */
export const getCollectionSlugsAsync = memoize(async (collection: string) => {
  const collectionMetadata = await getCollectionByNameAsync(collection)
  return collectionMetadata.map((article) => article.slug)
})
