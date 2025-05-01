/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import config from '@/data/config.json'
import { cx } from '@/utils/cx'

import { Button } from './button'
import { NavIcons } from './nav-icons'
import { PAGE_LAYOUT } from './page'
import { ThemeSwitcher } from './theme'

export function Header({ className }: { className?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header
      className={cx('py-6 px-4 md:px-6 print:hidden', PAGE_LAYOUT, className)}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter uppercase">
          {config.headerTitle}
        </Link>

        <nav className="hidden sm:flex items-center space-x-10">
          {config.sections.map((section) => {
            return (
              <Link
                key={section.name}
                href={'/' + section.name.toLowerCase()}
                className="text-sm uppercase tracking-wide hover:text-muted-foreground"
              >
                {section.name}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center">
          <NavIcons />
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="hidden p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="hidden mt-6 border-t border-border pt-6">
          <nav className="flex flex-col space-y-6">
            {config.sections
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((section) => {
                return (
                  <Link
                    key={section.name}
                    href={'/' + section.name.toLowerCase()}
                    className="text-sm uppercase tracking-wide"
                  >
                    {section.name}
                  </Link>
                )
              })}
          </nav>
        </div>
      )}
    </header>
  )
}
