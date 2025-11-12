'use client'

import { Button, cn } from '@shadcn/ui'
import { Share2 } from 'lucide-react'
import * as React from 'react'

import { XIcon } from '@/components/icons'

export function ArticleFooter({ className }: { className?: string }) {
  const twitterShare = () => {
    if (window && document) {
      const href = encodeURIComponent(window.location.href)
      const title = encodeURIComponent(document.title)
      const url = `https://twitter.com/intent/tweet?url=${href}&text=${title}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const browserShare = () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href })
    }
  }

  return (
    <footer className={cn('mt-12 pt-8 print:hidden', className)}>
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={browserShare}>
          Share
        </Button>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="p-0 cursor-pointer"
            onClick={twitterShare}
          >
            <XIcon />
            <span className="sr-only">Share on Twitter</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="p-0 cursor-pointer"
            onClick={browserShare}
          >
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </div>
    </footer>
  )
}
