/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { cn } from '@shadcn/ui'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export function TableOfContents() {
  const [isOpen, setIsOpen] = useState(false)
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number }[]
  >([])

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 10
    const delay = 200 // ms between checks
    const checkForHeadings = () => {
      const article = document.querySelector('article')
      if (!article) return

      const headingElements = article.querySelectorAll('h2, h3')
      if (headingElements.length > 0) {
        const headingsData = Array.from(headingElements).map((heading) => ({
          id: heading.id,
          text: heading.textContent || '',
          level: heading.tagName === 'H2' ? 2 : 3,
        }))
        setHeadings(headingsData)
      } else if (attempts < maxAttempts) {
        attempts++
        setTimeout(checkForHeadings, delay)
      }
    }

    checkForHeadings()
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="mb-8 border-b border-border pb-6 print:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-lef cursor-pointer"
      >
        <span className="text-xs uppercase tracking-widest">Contents</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <nav className="mt-4">
          <ul className="space-y-2 list-none ps-0">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={cn('p-0', heading.level === 3 ? 'ml-4' : '')}
              >
                <a
                  href={`#${heading.id}`}
                  className="text-sm font-normal text-muted-foreground hover:text-muted-foreground/80 no-underline"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
