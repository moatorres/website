'use server'

import type { LinkMetadata } from './types'

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

    const html = await response.text()

    // Simple regex-based metadata extraction
    const metadata: LinkMetadata = {
      url,
      title:
        extractMetaContent(html, 'property="og:title"') ||
        extractMetaContent(html, 'name="twitter:title"') ||
        extractTitle(html) ||
        'Untitled Link',
      description:
        extractMetaContent(html, 'property="og:description"') ||
        extractMetaContent(html, 'name="twitter:description"') ||
        extractMetaContent(html, 'name="description"') ||
        null,
      image:
        extractMetaContent(html, 'property="og:image"') ||
        extractMetaContent(html, 'name="twitter:image"') ||
        null,
      siteName:
        extractMetaContent(html, 'property="og:site_name"') ||
        new URL(url).hostname ||
        null,
      favicon: getFaviconUrl(url),
    }

    return metadata
  } catch (error) {
    console.error('Error fetching metadata:', error)
    throw new Error('Failed to fetch link metadata')
  }
}

function extractMetaContent(
  html: string,
  attributePattern: string
): string | null {
  const regex = new RegExp(
    `<meta\\s+[^>]*${attributePattern}[^>]*content=["']([^"']+)["'][^>]*>`,
    'i'
  )
  const match = html.match(regex)
  return match ? match[1] : null
}

function extractTitle(html: string): string | null {
  const titleRegex = /<title[^>]*>([^<]+)<\/title>/i
  const match = html.match(titleRegex)
  return match ? match[1] : null
}

function getFaviconUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return `${parsedUrl.origin}/favicon.ico`
  } catch {
    return null
  }
}
