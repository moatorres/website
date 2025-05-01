/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import type { MetadataRoute } from 'next'

import config from '@/data/config.json'
import { getArticles } from '@/utils/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = getArticles().map((metadata) => ({
    url: config.baseUrl + metadata.href,
    lastModified: metadata.updatedAt,
  }))

  const staticPages = ['', '/about', '/blog', '/quotes'].map((page) => ({
    url: `${config.baseUrl}/${page}`,
    lastModified: new Date().toISOString(),
  }))

  return [...staticPages, ...articles]
}
