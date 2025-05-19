import { unstable_ViewTransition as ViewTransition } from 'react'

import { NonceProvider } from '@/components/context/nonce-context'
import { Page, PageSection } from '@/components/page'
import { generateNonce } from '@/lib/nonce'

export default async function Layout({ children }: React.PropsWithChildren) {
  const nonce = await generateNonce()

  return (
    <ViewTransition>
      <NonceProvider nonce={nonce}>
        <Page className="min-h-[79.25vh]">
          <PageSection className="flex items-center">{children}</PageSection>
        </Page>
      </NonceProvider>
    </ViewTransition>
  )
}
