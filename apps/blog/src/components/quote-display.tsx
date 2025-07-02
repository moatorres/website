'use client'

import { cn } from '@shadcn/ui'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import { QuoteIcon } from '@/components/icons'
import {
  categories,
  Category,
  getCollections,
  getRandomQuote,
  Quote,
} from '@/lib/quotes'

export type QuoteDisplayProps = {
  quote?: Quote
  category?: Category
}

export function QuoteDisplay(props: QuoteDisplayProps) {
  const [category, setCategory] = React.useState<Category>(
    props.category ?? 'random'
  )
  const [quote, setQuote] = React.useState(
    props.quote ?? getRandomQuote(category)
  )
  const searchParams = useSearchParams()
  const collections = getCollections()

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const updateSearchParams = (category: Category) => {
    const newQueryString = createQueryString('category', category)
    const url = new URL(window.location.href)
    url.search = newQueryString
    window.history.replaceState(null, '', url.toString())
  }

  return (
    <React.Fragment>
      {/* Categories */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent z-10" />
        <nav
          className={cn(
            'relative flex gap-4 overflow-x-auto scroll-smooth touch-pan-x snap-x snap-mandatory',
            'no-scrollbar scroll-area'
          )}
        >
          {Object.keys(categories).map((key) => (
            <button
              key={key}
              onClick={() => {
                setQuote(getRandomQuote(key as Category))
                updateSearchParams(key as Category)
                setCategory(key as Category)
              }}
              className={`snap-start tracking-wider text-sm lowercase cursor-pointer transition-all ease-linear duration-300 ${
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
            </button>
          ))}
        </nav>
      </div>

      {/* Quote */}
      <div className="relative">
        <motion.div
          key={quote.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pt-8"
        >
          <div className="absolute top-48 -left-4 opacity-10 text-muted-foreground">
            <QuoteIcon />
          </div>
          <p className="text-2xl md:text-3xl font-light mb-8 leading-relaxed lowercase">
            {quote.text}
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base lowercase"
          >
            {quote.author}
          </motion.p>
        </motion.div>
      </div>
    </React.Fragment>
  )
}
