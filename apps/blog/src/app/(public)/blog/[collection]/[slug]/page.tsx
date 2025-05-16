/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { formatDate } from '@blog/utils'
import { Skeleton } from '@shadcn/ui'
import { notFound } from 'next/navigation'
import { Metadata } from 'next/types'
import React from 'react'
import { Suspense } from 'react'

import { ArticleSkeleton } from '@/components/skeleton'
import { Toc } from '@/components/toc'
import collections from '@/data/collections.json'
import config from '@/data/config.json'
import { getArticleBySlug, getCollectionByName } from '@/lib/articles'

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
  const article = getArticleBySlug(slug)
  const ogImageUrl = `/og?title=${encodeURIComponent(
    article.title
  )}&description=${encodeURIComponent(article.summary)}`

  return {
    title: article.title,
    description: article.summary,
    keywords: [article.collection, article.category],
    authors: [{ name: config.author, url: config.baseUrl }],
    alternates: {
      canonical: config.baseUrl.concat(article.href),
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      publishedTime: new Date(article.date).toISOString(),
      type: 'article',
      url: config.baseUrl.concat(article.href),
      locale: 'en_US',
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [{ url: ogImageUrl }],
      creator: '@moatorres',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function BlogArticle({ params }: Props) {
  const { collection, slug } = await params
  const { category, date, summary, title, href, updatedAt } =
    getArticleBySlug(slug)

  const MdxContent = await getContent(collection, slug)

  return (
    <React.Fragment>
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
            url: config.baseUrl.concat(href),
            author: {
              '@type': 'Person',
              name: config.author,
            },
          }),
        }}
      />

      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
        {category}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-6 text-[var(--tw-prose-headings)]">
        {title}
      </h1>
      <p className="flex justify-between -mt-4 mb-10 text-muted">{summary}</p>
      <p className="flex justify-between text-sm text-muted-foreground mb-6">
        {formatDate(date)}
      </p>
      <Suspense fallback={<Skeleton className="h-14" />}>
        <Toc />
      </Suspense>
      <Suspense fallback={<ArticleSkeleton />}>
        <MdxContent />
      </Suspense>
    </React.Fragment>
  )
}
