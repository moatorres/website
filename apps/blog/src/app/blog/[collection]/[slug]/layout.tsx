/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { unstable_ViewTransition as ViewTransition } from 'react'

import { BlogLayout } from '@/components/blog-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <BlogLayout>{children}</BlogLayout>
    </ViewTransition>
  )
}
