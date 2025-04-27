/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { readdirSync } from 'fs'
import { join } from 'path'

import { notFound } from 'next/navigation'
import { Metadata } from 'next/types'

import { TableOfContents } from '@/components/table-of-contents'
import config from '@/data/config.json'
import { formatDate } from '@/utils/format'
import { ContentMetadata } from '@/utils/types'

type PageProps = {
  params: Promise<{
    collection: string
    slug: string
  }>
}

async function getContent(collection: string, slug: string) {
  try {
    const collectionMetadata = await import(
      `@/data/${collection}.collection.json`
    )
    const [entry] = collectionMetadata.default.filter(
      (metadata: ContentMetadata) => metadata.slug === slug
    )
    const content = await import(`@/content/${collection}/${entry.filename}`)
    return { content }
  } catch {
    throw notFound()
  }
}

export async function generateStaticParams() {
  const categories = readdirSync(config.contentDirectory, {
    withFileTypes: true,
  })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  let paths: { collection: string; slug: string }[] = []

  for (const collection of categories) {
    const files = readdirSync(join(config.contentDirectory, collection))
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => ({
        collection,
        slug: file.replace(/\.mdx$/, ''),
      }))

    paths = paths.concat(files)
  }

  return paths
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { collection, slug } = await params
  const { content } = await getContent(collection, slug)
  const { title, summary: description, href } = content.metadata
  const ogImage = `${config.previewUrl}/og?title=${encodeURIComponent(title)}`

  return {
    description,
    openGraph: {
      description,
      images: [{ url: ogImage }],
      publishedTime: new Date(content.metadata.date).toISOString(),
      title,
      type: 'article',
      url: config.previewUrl + href,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [ogImage],
      title,
    },
  }
}

export default async function BlogArticle({ params }: PageProps) {
  const { collection, slug } = await params
  const { content } = await getContent(collection, slug)

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: content.metadata.title,
            datePublished: content.metadata.date,
            dateModified: content.metadata.date,
            description: content.metadata.summary,
            image: content.metadata.image
              ? `${config.previewUrl}${content.metadata.image}`
              : `/og?title=${encodeURIComponent(content.metadata.title)}`,
            url: `${config.previewUrl}/blog/${content.slug}`,
            author: {
              '@type': 'Person',
              name: 'Moa Torres',
            },
          }),
        }}
      />

      <h5 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
        {content.metadata.category}
      </h5>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-6 text-[var(--tw-prose-headings)]">
        {content.metadata.title}
      </h1>

      <h6 className="text-sm text-muted-foreground mb-12">
        {formatDate(content.metadata.date)}
      </h6>

      <TableOfContents />

      <content.default />
    </section>
  )
}
