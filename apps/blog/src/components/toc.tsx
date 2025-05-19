'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
} from '@shadcn/ui'
import * as React from 'react'

export function Toc() {
  const [headings, setHeadings] = React.useState<
    { id: string; text: string; level: number }[]
  >([])

  React.useEffect(() => {
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
    <div className="mb-8 border-b border-border print:hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="contents">
          <AccordionTrigger className="text-xs uppercase decoration-transparent tracking-widest font-normal text-muted-foreground">
            Table of Contents
          </AccordionTrigger>
          <AccordionContent>
            <nav>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
