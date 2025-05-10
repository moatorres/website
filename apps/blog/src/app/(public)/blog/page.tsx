/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { formatDate } from '@blog/utils'
import { Button } from '@shadcn/ui'
import Link from 'next/link'
import React, { useState } from 'react'
import { useMemo } from 'react'

import { Page, PageHeading, PageSection } from '@/components/page'
import articles from '@/data/articles.json'

const categories = ['All', ...new Set(articles.map((entry) => entry.category))]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 8

  // Filter entries by category
  const filteredEntries = useMemo(() => {
    const sortedArticles = articles.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return activeCategory === 'All'
      ? sortedArticles
      : sortedArticles.filter((entry) => entry.category === activeCategory)
  }, [activeCategory])

  // Calculate pagination
  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = filteredEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  )
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage)

  return (
    <Page>
      <PageSection>
        <PageHeading>Blog</PageHeading>
        <div className="max-w-2xl">
          <p className="hidden leading-relaxed text-muted-foreground">
            No noise, just ideas—sorted to make browsing easier. Whether
            you&apos;re curious about tech, leadership, or critical thinking,
            everything here is organized by category.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 text-sm">
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

        {/* Blog Entries */}
        <div className="max-w-4xl">
          {currentEntries.map((article) => (
            <article key={article.id} className="mb-4 pb-4">
              <div className="grid md:grid-cols-[1fr_3fr] gap-6 md:gap-12">
                <div className="space-y-1 mt-0.5 md:block hidden">
                  <div className="text-sm text-muted-foreground">
                    {article.category}
                  </div>
                  <div className="text-sm">{formatDate(article.date)}</div>
                  <div className="text-sm text-muted-foreground">
                    {article.readTime} read
                  </div>
                </div>

                <div>
                  <Link href={article.href}>
                    <h2 className="text-xl mb-3 hover:text-muted-foreground transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4">
                    {article.summary}
                  </p>
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="text-xs uppercase tracking-wider h-8 px-3"
            >
              Next
            </Button>
          </div>
        )}
      </PageSection>
    </Page>
  )
}
