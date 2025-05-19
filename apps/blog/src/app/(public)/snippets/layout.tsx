import { unstable_ViewTransition as ViewTransition } from 'react'

import { NonceProvider } from '@/components/context/nonce-context'
import { generateNonce } from '@/lib/nonce'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = await generateNonce()
  return (
    <ViewTransition>
      <NonceProvider nonce={nonce}>{children}</NonceProvider>
    </ViewTransition>
  )
}
