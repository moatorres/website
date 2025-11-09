'use client'

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn/ui'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ModeToggle({ compact = false }: { compact?: boolean }) {
  const { setTheme, theme } = useTheme()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`${compact ? 'h-7 px-2' : 'h-8 px-3'} hover:bg-muted`}
          >
            <Sun
              className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`}
            />
            <Moon
              className={`absolute ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
