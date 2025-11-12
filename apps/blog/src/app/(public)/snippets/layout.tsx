import { ViewTransition } from 'react'

import { NonceProvider } from '@/components/context/nonce'
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
