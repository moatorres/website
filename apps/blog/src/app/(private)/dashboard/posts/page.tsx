/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { Metadata } from 'next'

import { PageHeading } from '@/components/page'
import articles from '@/data/articles.json'

import { PostsTable } from './posts-table'

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Blog posts about open source software.',
}

export default function PostsPage() {
  return (
    <div className="@container/page flex flex-1 flex-col gap-8 px-6 py-1">
      <PageHeading className="mb-0">Blog Posts</PageHeading>
      <PostsTable data={articles} />
    </div>
  )
}
