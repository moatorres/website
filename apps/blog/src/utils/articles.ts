/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { stat } from 'fs/promises'
import { join } from 'path'

import { memoize, slugify } from '@blog/utils'

import config from '../data/config.json'

export type ContentMetadata = {
  author: string
  category: string
  date: string
  summary: string
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
export const getArticles = memoize(function getArticles() {
  const filePath = join(config.metadataDirectory, 'articles.json')
  const fileContent = readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContent) as ArticleMetadata[]
})

/**
 * Returns the three latest articles sorted by date in descending order.
 */
export const getLatestArticles = memoize(function getLatestArticles() {
  return getArticles()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
})

/**
 * Retrieves a single article by its slug.
 * @throws {Error} If no article is found for the provided slug.
 */
export const getArticleBySlug = memoize(function getArticle(slug: string) {
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

/**
 * Calculates the read time of an article based on its word count.
 * @returns The estimated read time in minutes.
 */
export function getReadTime(filepath: string, wordsPerMinute = 200) {
  const wordsCount = readFileSync(filepath).toString().split(/\s+/).length
  return `${Math.ceil(wordsCount / wordsPerMinute)} min`
}

/**
 * Extracts metadata from an article file and returns it as an object.
 * @throws {Error} If the file cannot be read or the content is not valid JSON.
 */
export async function extractArticleMetadata(
  filepath: string,
  fileName: string,
  collection: string
): Promise<ArticleMetadata> {
  const slug = slugify(fileName.replace(/\.mdx$/, ''))
  const content = await import(filepath)
  const stats = await stat(filepath)

  return {
    id: randomUUID(),
    slug,
    href: `/${config.contentRoute}/${collection}/${slug}`,
    author: config.author,
    category: content.metadata.category,
    date: content.metadata.date,
    title: content.metadata.title,
    summary: content.metadata.summary,
    fileName,
    filePath: filepath,
    collection,
    readTime: getReadTime(filepath),
    createdAt: new Date(stats.ctime).toISOString(),
    updatedAt: new Date(stats.mtime).toISOString(),
    publishedAt: new Date(content.metadata.date).toISOString(),
  }
}
