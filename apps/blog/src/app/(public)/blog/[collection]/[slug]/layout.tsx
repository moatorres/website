/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { unstable_ViewTransition as ViewTransition } from 'react'

import { ArticleFooter } from '@/components/article-footer'
import { FloatingActions } from '@/components/floating-actions'
import { Page, PageSection } from '@/components/page'
import { ScrollToHash } from '@/components/scroll-to-hash'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <Page>
        <PageSection>
          <ScrollToHash offset={10} />
          <article className="prose max-w-none dark:prose-invert min-w-[100%] prose-p:text-muted-foreground prose-a:decoration-transparent prose-a:font-normal prose-h1:text-3xl prose-h1:md:text-5xl prose-h1:font-bold prose-h1:tracking-tight prose-h1:leading-tight prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-3 prose-h5:text-xs prose-h5:uppercase prose-h5:tracking-widest prose-h5:text-muted-foreground prose-h5:my-1 prose-h6:text-sm prose-h6:text-muted-foreground prose-h6:my-1">
            {children}
          </article>
          <ArticleFooter />
          <FloatingActions />
        </PageSection>
      </Page>
    </ViewTransition>
  )
}
