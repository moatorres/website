import { formatDate } from '@blog/utils'
import React from 'react'

import { getLatestArticles } from '@/utils/articles'

import { InlineLink } from './inline-link'

export function LatestArticles() {
  const articles = getLatestArticles()

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl mb-6">Latest Articles</h2>
      {articles.map((article) => (
        <div key={article.id} className="mb-4 pb-4">
          <div className="grid sm:grid-cols-[1fr_3fr] gap-6 md:gap-12">
            <div className="space-y-1 mt-0.5 sm:block hidden">
              <div className="text-sm text-muted-foreground">
                {article.category}
              </div>
              <div className="text-sm">{formatDate(article.date)}</div>
              <div className="text-sm text-muted-foreground">
                {article.readTime} read
              </div>
            </div>

            <div>
              <InlineLink href={article.href}>
                <h2 className="text-xl mb-3 hover:text-muted-foreground transition-colors">
                  {article.title}
                </h2>
              </InlineLink>
              <p className="text-sm text-muted-foreground mb-4">
                {article.summary}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
