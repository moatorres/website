'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { isAdmin } from '@/utils/auth'

type Session = {
  loggedIn: boolean
  isAdmin: boolean
  setSession?: (s: Session) => void
}

const SessionContext = createContext<Session>({
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
  const [session, setSession] = useState<Session>(defaultState)

  useEffect(() => {
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

export const useSession = () => useContext(SessionContext)
