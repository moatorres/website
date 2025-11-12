import { ViewTransition } from 'react'

import { Page } from '@/components/page'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <Page>{children}</Page>
    </ViewTransition>
  )
}
