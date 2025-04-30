/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import React from 'react'

import { ArticleFooter } from './article-footer'
import { FloatingActions } from './floating-actions'

export function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Fragment>
      <article className="prose max-w-none dark:prose-invert min-w-[100%]">
        {children}
      </article>
      <ArticleFooter />
      <FloatingActions />
    </React.Fragment>
  )
}
