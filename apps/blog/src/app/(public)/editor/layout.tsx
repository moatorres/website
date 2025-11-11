import { Provider as AtomsProvider } from 'jotai'
import { ViewTransition } from 'react'

import { WebContainerProvider } from './contexts/webcontainer-context'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <AtomsProvider>
        <WebContainerProvider>{children}</WebContainerProvider>
      </AtomsProvider>
    </ViewTransition>
  )
}
