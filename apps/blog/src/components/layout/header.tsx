'use client'

import { initials, lastSegment } from '@blog/utils'
import { Button, cn, useIsMobile } from '@shadcn/ui'
import * as LucideReact from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useSession } from '@/components/context/session'
import { DashboardMenu } from '@/components/dashboard/dashboard-menu'
import { ModeToggle } from '@/components/dashboard/mode-toggle'
import { MobileNav } from '@/components/navigation/nav-mobile'
import { InlineLink } from '@/components/ui/inline-link'
import config from '@/data/config.json'

type NavIconItem = {
  icon: keyof typeof LucideReact
  href: string
  title: string
  hidden?: boolean
  mobile?: boolean
}

const items: NavIconItem[] = [
  {
    title: 'Bookmarks',
    href: '/bookmarks',
    icon: 'BookmarkIcon',
    mobile: false,
    hidden: true,
  },
  {
    title: 'Quotes',
    href: '/quotes',
    icon: 'QuoteIcon',
    mobile: false,
    hidden: false,
  },
  {
    title: 'Blog',
    href: '/blog',
    icon: 'FileTextIcon',
    mobile: true,
    hidden: false,
  },
  {
    title: 'Snippets',
    href: '/snippets',
    icon: 'CodeIcon',
    mobile: true,
    hidden: false,
  },
  {
    title: 'Photos',
    href: '/photos',
    icon: 'CameraIcon',
    mobile: true,
    hidden: false,
  },
  {
    title: 'Sponsor',
    href: 'https://github.com/sponsors/' + lastSegment(config.githubUrl),
    icon: 'HeartIcon',
    mobile: false,
    hidden: false,
  },
  {
    title: 'GitHub',
    href: config.githubUrl,
    icon: 'GithubIcon',
    mobile: true,
    hidden: false,
  },
  {
    title: 'RSS',
    href: '/rss',
    icon: 'RssIcon',
    mobile: false,
    hidden: false,
  },
]

export function Header({ className }: { className?: string }) {
  const { isAdmin } = useSession()
  const isMobile = useIsMobile()

  return (
    <header className={cn('py-6 px-8 print:hidden', className)}>
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter uppercase">
          {initials(config.title)}
        </Link>

        <span className="flex items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            {!isMobile &&
              config.sections.map((section) => {
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
            {!isAdmin && !isMobile && (
              <Link
                href="/login"
                className="text-sm capitalize tracking-wide text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
            )}
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
                    className={cn(
                      'hidden text-muted-foreground px-0',
                      !item.hidden &&
                        (item.mobile ? 'inline-flex' : 'hidden md:inline-flex')
                    )}
                    asChild
                  >
                    <InlineLink href={item.href}>
                      <Icon strokeWidth={1.625} />
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
