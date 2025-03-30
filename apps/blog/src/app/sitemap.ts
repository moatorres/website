/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import type { MetadataRoute } from 'next'

import config from '@/data/config.json'
import { getArticles } from '@/utils/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = getArticles().map((metadata) => ({
    url: config.url + metadata.href,
    lastModified: metadata.updatedAt,
  }))

  const staticPages = ['', '/about', '/journal'].map((page) => ({
    url: `${config.url}/${page}`,
    lastModified: new Date().toISOString(),
  }))

  return [...staticPages, ...articles]
}
