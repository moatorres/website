'use client'

import { motion } from 'framer-motion'

import { QuoteIcon } from '@/icons'
import { Category, Quote } from '@/utils/quotes'

import { QuotesNav } from './quotes-nav'

export type QuoteDisplayProps = {
  quote: Quote
  subject: Category
}

export function QuoteDisplay({ quote, subject }: QuoteDisplayProps) {
  return (
    <>
      <QuotesNav subject={subject} />
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
    </>
  )
}
