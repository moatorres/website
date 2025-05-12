/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { Button } from '@shadcn/ui'
import { ArrowUp, Download, FileText } from 'lucide-react'
import React from 'react'

export function FloatingActions() {
  return (
    <div className="hidden md:flex fixed bottom-8 right-8 flex-col gap-3 z-10">
      <Button
        variant="outline"
        size="icon"
        title="Scroll to top"
        aria-label="Scroll to top"
        className="rounded-full h-10 w-10 cursor-pointer"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      >
        <ArrowUp className="h-5 w-5" />
        <span className="sr-only">Scroll to top</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        title="Toggle reader view"
        aria-label="Toggle reader view"
        className="rounded-full h-10 w-10 cursor-pointer"
        onClick={() => {
          document.body.classList.toggle('reader-view')
        }}
      >
        <FileText className="h-5 w-5" />
        <span className="sr-only">Cite</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        title="Save"
        aria-label="Download PDF"
        className="rounded-full h-10 w-10 cursor-pointer"
        onClick={() => {
          window.print()
        }}
      >
        <Download className="h-5 w-5" />
        <span className="sr-only">Download PDF</span>
      </Button>
    </div>
  )
}
