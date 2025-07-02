'use client'

import { cn } from '@shadcn/ui'
import Link from 'next/link'
import React from 'react'

import { categories, Category, getCollections } from '@/lib/quotes'

export function QuotesNav({ category }: { category: Category }) {
  const collections = getCollections()

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent z-10" />
      <nav
        className={cn(
          'relative flex gap-4 px-2 overflow-x-auto scroll-smooth touch-pan-x snap-x snap-mandatory',
          'no-scrollbar scroll-area'
        )}
      >
        {Object.keys(categories).map((key) => (
          <Link
            key={key}
            href={`/quotes?category=${key}`}
            scroll={false}
            className={`snap-start tracking-wider text-sm lowercase ${
              key === category
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              {key}{' '}
              <sup className="text-xs hidden sm:inline relative -top-0.5">
                {collections[key]?.size ?? 0}
              </sup>
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
