/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
} from '@shadcn/ui'
import { useEffect, useState } from 'react'

export function Toc() {
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number }[]
  >([])

  useEffect(() => {
    const article = document.querySelector('article')

    if (!article) return

    const headingElements = article.querySelectorAll('h2, h3')
    const headingsData = Array.from(headingElements).map((heading) => {
      return {
        id: heading.id,
        text: heading.textContent || '',
        level: heading.tagName === 'H2' ? 2 : 3,
      }
    })

    setHeadings(headingsData)
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="mb-8 border-b border-border pb-6 print:hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="contents">
          <AccordionTrigger>
            <span className="text-xs uppercase tracking-widest">Contents</span>
          </AccordionTrigger>
          <AccordionContent>
            <nav className="mt-4">
              <ul className="space-y-2 list-none ps-0">
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    className={cn('p-0', heading.level === 3 ? 'ml-4' : '')}
                  >
                    <a
                      href={`#${heading.id}`}
                      className="text-sm font-normal text-gray-500 dark:text-gray-400 hover:text-gray-300 no-underline"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
