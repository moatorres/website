'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn/ui'
import { MoonIcon, SunIcon, MonitorIcon } from 'lucide-react'

export function ModeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const Icon = React.useMemo(() => {
    if (!mounted) return SunIcon
    if (theme === 'system') return MonitorIcon
    return resolvedTheme === 'dark' ? MoonIcon : SunIcon
  }, [mounted, theme, resolvedTheme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Toggle theme"
        >
          <Icon strokeWidth={1.625} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <SunIcon className="mr-2 size-4" strokeWidth={1.625} /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <MoonIcon className="mr-2 size-4" strokeWidth={1.625} /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <MonitorIcon className="mr-2 size-4" strokeWidth={1.625} /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
