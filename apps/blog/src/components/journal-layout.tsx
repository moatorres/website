import React from 'react'

import { FloatingActions } from './floating-actions'

export function JournalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 px-4 md:px-6 pt-4 md:pt-6">
      <article className="prose max-w-none dark:prose-invert min-w-[100%]">
        {children}

        {/* Article Footer */}
        {/* <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-xs uppercase tracking-widest">Click to share</div>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="p-0">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>
        </footer> */}
      </article>

      {/* Floating actions */}
      <FloatingActions />
    </main>
  )
}
