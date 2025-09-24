'use client'

import { Button } from '@shadcn/ui'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group/toggle size-8 text-muted-foreground"
      onClick={toggleTheme}
    >
      <SunIcon strokeWidth={1.625} className="hidden [html.dark_&]:block" />
      <MoonIcon strokeWidth={1.625} className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
