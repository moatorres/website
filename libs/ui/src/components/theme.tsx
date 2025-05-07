/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { ThemeProviderProps } from 'next-themes'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Button } from './button'

const NextThemesProvider = dynamic(
  () => import('next-themes').then((e) => e.ThemeProvider),
  { ssr: false }
)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="soft"
      title="Toggle Color Scheme"
      className="group/toggle h-8 w-8 px-0"
      onClick={toggleTheme}
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
