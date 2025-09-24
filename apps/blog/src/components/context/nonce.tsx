'use client'

import React from 'react'

type NonceContext = string | null

const NonceContext = React.createContext<NonceContext | undefined>(undefined)

export const useNonce = () => {
  const context = React.useContext(NonceContext)
  if (!context) throw new Error('useNonce must be used within a NonceProvider')
  return context
}

export const NonceProvider = ({
  nonce,
  children,
}: {
  nonce: NonceContext
  children: React.ReactNode
}) => {
  const [token, setNonce] = React.useState<string | null>(nonce)

  React.useEffect(() => {
    setNonce(nonce)
  }, [nonce])

  return <NonceContext.Provider value={token}>{children}</NonceContext.Provider>
}
