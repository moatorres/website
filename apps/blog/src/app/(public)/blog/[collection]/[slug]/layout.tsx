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
          <article className="prose max-w-none dark:prose-invert min-w-[100%] prose-p:text-muted-foreground">
            {children}
          </article>
          <ArticleFooter />
          <FloatingActions />
        </PageSection>
      </Page>
    </ViewTransition>
  )
}
