/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import Link from 'next/link'

import { getLatestArticles } from '@/utils/articles'
import { formatDate } from '@/utils/format'

export default function EssaysPage() {
  const articles = getLatestArticles()

  return (
    <main className="flex-1 px-4 md:px-6 py-12 md:py-16">
      {/* Page Header */}
      <div className="max-w-2xl mb-16">
        <h1 className="text-2xl md:text-3xl font-medium mb-6">Moa Torres</h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Navigating complexity since the ’80s—across culture, politics, and
          science. Here, I share insights on software development, thoughtful
          leadership, and personal growth.
        </p>
      </div>

      {/* Latest Articles */}
      <div className="max-w-4xl">
        {articles.map((article) => (
          <article key={article.id} className="mb-12 pb-12 ">
            <div className="grid md:grid-cols-[1fr_3fr] gap-6 md:gap-12">
              <div className="space-y-1 mt-0.5 md:block hidden">
                <div className="text-xs text-muted-foreground">
                  {article.category}
                </div>
                <div className="text-xs">{formatDate(article.date)}</div>
                <div className="text-xs text-muted-foreground">
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
    </main>
  )
}
