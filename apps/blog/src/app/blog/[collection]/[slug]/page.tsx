/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { formatDate } from '@blog/utils'
import { notFound } from 'next/navigation'
import { Metadata } from 'next/types'
import React from 'react'
import { Suspense } from 'react'

import { PageSection } from '@/components/page'
import { ArticleSkeleton, Skeleton } from '@/components/skeleton'
import { TableOfContents } from '@/components/table-of-contents'
import collections from '@/data/collections.json'
import config from '@/data/config.json'
import { getArticleBySlug, getCollectionByName } from '@/utils/articles'

type Props = {
  params: Promise<{
    collection: string
    slug: string
  }>
}

async function getContent(collection: string, slug: string) {
  try {
    const { fileName } = getArticleBySlug(slug)
    return React.lazy(() => import(`@/content/${collection}/${fileName}`))
  } catch {
    throw notFound()
  }
}

export async function generateStaticParams() {
  let paths: Array<{ collection: string; slug: string }> = []

  for (const collection of collections) {
    const files = getCollectionByName(collection).map((file) => ({
      collection,
      slug: file.slug,
    }))

    paths = paths.concat(files)
  }

  return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { date, href, summary: description, title } = getArticleBySlug(slug)

  return {
    authors: [{ name: config.author, url: config.githubUrl }],
    description,
    openGraph: {
      description,
      publishedTime: new Date(date).toISOString(),
      title,
      type: 'article',
      url: config.baseUrl + href,
    },
    publisher: config.author,
    referrer: 'origin-when-cross-origin',
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      title,
    },
  }
}

export default async function BlogArticle({ params }: Props) {
  const { collection, slug } = await params
  const { category, date, summary, title, href, updatedAt } =
    getArticleBySlug(slug)

  const MdxContent = await getContent(collection, slug)

  return (
    <PageSection>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: title,
            datePublished: date,
            dateModified: updatedAt,
            description: summary,
            url: `${config.baseUrl + href}`,
            author: {
              '@type': 'Person',
              name: 'Moa Torres',
            },
          }),
        }}
      />

      <h5 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
        {category}
      </h5>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-6 text-[var(--tw-prose-headings)]">
        {title}
      </h1>

      <h6 className="flex justify-between text-sm text-muted-foreground mb-12">
        {formatDate(date)}{' '}
        <span className="text-xs">Updated on {formatDate(updatedAt)}</span>
      </h6>

      <Suspense fallback={<Skeleton className="h-14" />}>
        <TableOfContents />
      </Suspense>
      <Suspense fallback={<ArticleSkeleton />}>
        <MdxContent />
      </Suspense>
    </PageSection>
  )
}
