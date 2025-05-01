/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import type { MetadataRoute } from 'next'

import config from '@/data/config.json'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${config.baseUrl}/sitemap.xml`,
    host: config.baseUrl,
  }
}
