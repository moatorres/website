/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { Button } from '@blog/ui'
import { lastSegment } from '@blog/utils'
import * as lucide from 'lucide-react'

import config from '@/data/config.json'

import { InlineLink } from './inline-link'

const defaultItems: NavIconItem[] = [
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

type NavIconItem = {
  title: string
  href: string
  icon: keyof typeof lucide
}

type NavIconsProps = {
  items?: NavIconItem[]
}

export function NavIcons({ items = defaultItems }: NavIconsProps) {
  return (
    <>
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
    </>
  )
}
