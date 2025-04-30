/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import articles from '@/data/articles.json'
import config from '@/data/config.json'

export async function GET() {
  const itemsXml = articles
    .sort((a, b) => {
      if (new Date(a.date) > new Date(b.date)) {
        return -1
      }
      return 1
    })
    .map(
      (post) =>
        `<item>
          <title>${post.title}</title>
          <link>${config.previewUrl + post.href}</link>
          <description>${post.summary || ''}</description>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        </item>`
    )
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>${config.title}</title>
        <link>${config.previewUrl}</link>
        <description>This is ${config.author}'s RSS feed</description>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
