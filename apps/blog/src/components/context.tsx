/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from 'next-themes'
import React from 'react'

import { isAdmin } from '@/lib/session'

type Session = {
  loggedIn: boolean
  isAdmin: boolean
  setSession?: (s: Session) => void
}

const SessionContext = React.createContext<Session>({
  loggedIn: false,
  isAdmin: false,
  setSession: (s: Session) => void 0,
})

const defaultState = {
  loggedIn: false,
  isAdmin: false,
}

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [session, setSession] = React.useState<Session>(defaultState)

  React.useEffect(() => {
    ;(async () => {
      const res = await isAdmin()
      setSession(res ? { isAdmin: true, loggedIn: true } : defaultState)
    })()
  }, [])

  return (
    <SessionContext.Provider value={{ ...session, setSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => React.useContext(SessionContext)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
