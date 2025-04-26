/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { unstable_ViewTransition as ViewTransition } from 'react'

import { BlogLayout } from '@/components/blog-layout'
import { ScrollToHash } from '@/components/scroll-to-hash'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <ScrollToHash />
      <BlogLayout>{children}</BlogLayout>
    </ViewTransition>
  )
}
