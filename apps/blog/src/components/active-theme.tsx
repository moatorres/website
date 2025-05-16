/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import * as React from 'react'

const DEFAULT_THEME = 'default'

function setThemeCookie(theme: string) {
  if (typeof window === 'undefined') return
  const themeCookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax; `
  const secureCookie = window.location.protocol === 'https:' ? 'Secure;' : ''
  return (document.cookie = themeCookie.concat(secureCookie).trim())
}

type ThemeContextType = {
  activeTheme: string
  setActiveTheme: (theme: string) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
)

export function ActiveThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode
  initialTheme?: string
}) {
  const [activeTheme, setActiveTheme] = React.useState<string>(
    () => initialTheme ?? DEFAULT_THEME
  )

  React.useEffect(() => {
    setThemeCookie(activeTheme)

    Array.from(document.body.classList)
      .filter((className) => className.startsWith('theme-'))
      .forEach((className) => {
        document.body.classList.remove(className)
      })
    document.body.classList.add(`theme-${activeTheme}`)
    if (activeTheme.endsWith('-scaled')) {
      document.body.classList.add('theme-scaled')
    }
  }, [activeTheme])

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeConfig() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeConfig must be used within an ActiveThemeProvider')
  }
  return context
}
