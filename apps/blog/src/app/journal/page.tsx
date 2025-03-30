/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/button'
import journalEntries from '@/data/articles.json'
import { formatDate } from '@/utils/format'

const categories = ['All', ...new Set(journalEntries.map((entry) => entry.category))]

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 8

  // Filter entries by category
  const filteredEntries =
    activeCategory === 'All'
      ? journalEntries
      : journalEntries.filter((entry) => entry.category === activeCategory)

  // Calculate pagination
  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry)
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage)

  return (
    <main className="flex-1 px-4 md:px-6 py-12 md:py-16">
      {/* Journal Header */}
      <div className="max-w-2xl mb-16">
        <h1 className="text-2xl font-medium mb-6">Journal</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          No noise, just ideas—sorted to make browsing easier. Whether you&apos;re curious about
          tech, leadership, or critical thinking, everything here is organized by category.
        </p>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 text-xs">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category)
                setCurrentPage(1)
              }}
              className={`uppercase tracking-wider ${
                activeCategory === category
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Journal Entries */}
      <div className="grid gap-y-8 pt-6">
        {currentEntries.map((entry) => (
          <article key={entry.id} className="py-4">
            <div className="grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
              <div className="space-y-1 md:block hidden">
                <div className="text-xs text-muted-foreground">{entry.category}</div>
                <div className="text-xs">{formatDate(entry.date)}</div>
                <div className="text-xs text-muted-foreground">{entry.readTime} read</div>
              </div>
              <div className="space-y-2">
                <Link href={entry.href}>
                  <h2 className="text-lg font-medium hover:text-muted-foreground transition-colors">
                    {entry.title}
                  </h2>
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed">{entry.summary}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-8 border-t border-border mt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="text-xs uppercase tracking-wider h-8 px-3"
          >
            Previous
          </Button>
          <div className="text-xs">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-xs uppercase tracking-wider h-8 px-3"
          >
            Next
          </Button>
        </div>
      )}
    </main>
  )
}
