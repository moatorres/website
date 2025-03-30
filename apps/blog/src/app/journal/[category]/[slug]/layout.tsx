/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { unstable_ViewTransition as ViewTransition } from 'react'

import { JournalLayout } from '@/components/journal-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <JournalLayout>{children}</JournalLayout>
    </ViewTransition>
  )
}
