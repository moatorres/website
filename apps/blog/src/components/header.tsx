/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { initials, lastSegment } from '@blog/utils'
import { Button, cn } from '@shadcn/ui'
import * as LucideReact from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import config from '@/data/config.json'

import { useSession } from './context'
import { DashboardMenu } from './dashboard-menu'
import { InlineLink } from './inline-link'
import { ModeToggle } from './mode-toggle'
import { MobileNav } from './nav-mobile'

type NavIconItem = {
  title: string
  href: string
  icon: keyof typeof LucideReact
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
    title: 'Blog',
    href: '/blog',
    icon: 'FileTextIcon',
  },
  {
    title: 'Sponsor',
    href: 'https://github.com/sponsors/' + lastSegment(config.githubUrl),
    icon: 'HeartIcon',
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
  const { isAdmin } = useSession()

  return (
    <header
      className={cn('py-6 px-8 text-muted-foreground print:hidden', className)}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter uppercase">
          {initials(config.title)}
        </Link>

        <span className="flex items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            {config.sections.map((section) => {
              return (
                <Link
                  key={section.name}
                  href={'/' + section.name.toLowerCase()}
                  className="text-sm capitalize tracking-wide text-muted-foreground hover:text-foreground"
                >
                  {section.name}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center space-x-4">
            <div className="mr-2">
              {items.map((item, index) => {
                const Icon = LucideReact[item.icon] as React.JSX.ElementType

                return (
                  <Button
                    key={index}
                    title={item.title}
                    aria-label={item.title}
                    variant="ghost"
                    size="icon"
                    className="hidden md:inline-flex text-muted-foreground px-0"
                    asChild
                  >
                    <InlineLink href={item.href}>
                      <Icon strokeWidth={1.5} />
                      <span className="sr-only">{item.title}</span>
                    </InlineLink>
                  </Button>
                )
              })}
              <ModeToggle />
            </div>
            <MobileNav />
            {isAdmin && <DashboardMenu />}
          </div>
        </span>
      </div>
    </header>
  )
}
