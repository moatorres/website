'use client'

import { Download, FileText } from 'lucide-react'
import React from 'react'

import { Button } from './button'

export function FloatingActions() {
  return (
    <div className="hidden md:flex fixed bottom-8 right-8 flex-col gap-3">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-10 w-10"
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
        className="rounded-full h-10 w-10"
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
