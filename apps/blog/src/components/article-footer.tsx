/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { capitalize } from '@blog/utils'
import { Button, cn } from '@shadcn/ui'
import { Share2 } from 'lucide-react'
import * as React from 'react'

import * as icons from '@/components/icons'

type SocialShare = {
  url: string
  icon: keyof typeof icons
  platform: string
  hidden?: boolean
  active?: boolean
}

const socials: SocialShare[] = [
  {
    platform: 'Twitter',
    icon: 'XIcon',
    url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      window.location.href
    )}&text=${encodeURIComponent(document.title)}`,
    active: true,
    hidden: true,
  },
  {
    platform: 'WhatsApp',
    icon: 'WhatsAppIcon',
    url: ``,
    active: false,
    hidden: true,
  },
  {
    platform: 'Facebook',
    icon: 'FacebookIcon',
    url: ``,
    active: false,
    hidden: true,
  },
]

export function ArticleFooter(className: { className?: string }) {
  const browserSharing = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      })
    }
  }

  return (
    <footer className={cn('mt-12 pt-8 print:hidden', className)}>
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={browserSharing}
          className="cursor-pointer"
        >
          Share
        </Button>
        <div className="flex gap-4">
          {socials.map((item, idx) => {
            if (item.hidden) return null

            const Icon = icons[item.icon]

            return (
              <Button
                key={idx}
                variant="ghost"
                size="icon"
                className="p-0 cursor-pointer"
                onClick={() => {
                  if (item.active && item.url) {
                    window.open(item.url, '_blank', 'noopener,noreferrer')
                  }
                }}
              >
                <Icon />
                <span className="sr-only">
                  Share on {capitalize(item.platform)}
                </span>
              </Button>
            )
          })}

          <Button
            variant="ghost"
            size="icon"
            className="p-0 cursor-pointer"
            onClick={browserSharing}
          >
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </div>
    </footer>
  )
}
