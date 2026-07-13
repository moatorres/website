import { ViewTransition } from 'react'

import { WebContainerProvider } from './contexts/webcontainer'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <WebContainerProvider>{children}</WebContainerProvider>
    </ViewTransition>
  )
}
