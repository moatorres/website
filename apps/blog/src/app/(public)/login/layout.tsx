/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { unstable_ViewTransition as ViewTransition } from 'react'

import { Page, PageSection } from '@/components/page'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <Page className="min-h-auto h-120 sm:h-150">
        <PageSection className="flex items-center">{children}</PageSection>
      </Page>
    </ViewTransition>
  )
}
