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
  const ogImageUrl = `${config.baseUrl}/og?title=${encodeURIComponent(article.title)}&description=${encodeURIComponent(article.description)}`

  return {
    title: article.title,
    description: article.description,
    keywords: [article.collection, article.category],
    authors: [{ name: config.author, url: config.baseUrl }],
    alternates: {
      canonical: config.baseUrl.concat(article.href),
    },
    openGraph: {
      title: article.title,
      description: article.description,
      publishedTime: new Date(article.date).toISOString(),
      type: 'article',
      url: config.baseUrl.concat(article.href),
      locale: 'en_US',
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
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
  const { category, date, description, tags, title, href, updatedAt } =
    getArticleBySlug(slug)

  const MdxContent = await getContent(collection, slug)
  const fullUrl = config.baseUrl.concat(href)
  const ogImageUrl = `${config.baseUrl}/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`

  return (
    <React.Fragment>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': fullUrl,
            },
            headline: title,
            description: description,
            image: [ogImageUrl],
            author: {
              '@type': 'Person',
              name: config.author,
              url: config.baseUrl,
            },
            publisher: {
              '@type': 'Organization',
              name: config.author,
              logo: {
                '@type': 'ImageObject',
                url: `${config.baseUrl}/favicon/android-chrome-512x512.png`,
              },
            },
            datePublished: date,
            dateModified: updatedAt ?? date,
            url: fullUrl,
            keywords: [collection, category, ...tags].join(', '),
            articleSection: category,
            inLanguage: 'en',
          }),
        }}
      />

      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
        {category}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-6 text-[var(--tw-prose-headings)]">
        {title}
      </h1>
      <p className="flex justify-between -mt-4 mb-10 text-muted">
        {description}
      </p>
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
