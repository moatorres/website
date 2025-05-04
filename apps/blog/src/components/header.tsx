/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { initials, lastSegment } from '@blog/utils'
import { Menu, X } from 'lucide-react'
import * as lucide from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import config from '@/data/config.json'
import { cx } from '@/utils/cx'

import { Button } from './button'
import { InlineLink } from './inline-link'
import { PAGE_LAYOUT } from './page'
import { ThemeSwitcher } from './theme'

type NavIconItem = {
  title: string
  href: string
  icon: keyof typeof lucide
}

const items: NavIconItem[] = [
  {
    title: 'Bookmarks',
    href: '/bookmarks',
    icon: 'BookmarkIcon',
  },
  {
    title: 'Quotes',
    href: '/quotes',
    icon: 'QuoteIcon',
  },
  {
    title: 'Photos',
    href: '/photos',
    icon: 'CameraIcon',
  },
  {
    title: 'Sponsor',
    href: 'https://github.com/sponsors/' + lastSegment(config.githubUrl),
    icon: 'HeartIcon',
  },
  {
    title: 'Blog',
    href: '/blog',
    icon: 'FileTextIcon',
  },
  {
    title: 'GitHub',
    href: config.githubUrl,
    icon: 'GithubIcon',
  },
  {
    title: 'RSS',
    href: '/rss',
    icon: 'RssIcon',
  },
]

export function Header({ className }: { className?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header
      className={cx('py-6 px-4 md:px-6 print:hidden', PAGE_LAYOUT, className)}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter uppercase">
          {initials(config.title)}
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
          {items.map((item, index) => {
            const Icon = require('lucide-react')[item.icon]

            return (
              <Button
                key={index}
                title={item.title}
                variant="soft"
                className="h-8 w-8 px-0"
                asChild
              >
                <InlineLink href={item.href}>
                  <Icon />
                  <span className="sr-only">{item.title}</span>
                </InlineLink>
              </Button>
            )
          })}
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
