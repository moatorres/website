'use client'

import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui'
import React from 'react'

import { useThemeConfig } from '@/components/active-theme'

const themeGroups = [
  {
    name: 'Default',
    themes: [
      { label: 'Default', value: 'default' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Stone', value: 'stone' },
      { label: 'Zinc', value: 'zinc' },
      { label: 'Gray', value: 'gray' },
      { label: 'Slate', value: 'slate' },
    ],
  },
  {
    name: 'Scaled',
    themes: [
      { label: 'Default', value: 'default-scaled' },
      { label: 'Blue', value: 'blue-scaled' },
    ],
  },
  {
    name: 'Monospaced',
    themes: [{ label: 'Mono', value: 'mono-scaled' }],
  },
]

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id="theme-selector"
          size="sm"
          className="justify-start *:data-[slot=select-value]:w-12"
        >
          <span className="text-muted-foreground hidden sm:block">
            Live View:
          </span>
          <span className="text-muted-foreground block sm:hidden">Theme</span>
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent align="end">
          {themeGroups.map((group, idx) => (
            <React.Fragment key={group.name}>
              <SelectGroup>
                <SelectLabel>{group.name}</SelectLabel>
                {group.themes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              {idx < themeGroups.length - 1 && <SelectSeparator />}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
