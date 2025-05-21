import React from 'react'

import { LinkCardGrid } from './components/link-card-grid'

export default function BookmarksPage() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center space-y-8 mb-10">
        <h1 className="text-3xl font-bold text-center">URL Preview Cards</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Enter a URL to create a preview card. Your links will be saved
          locally.
        </p>
      </div>
      <LinkCardGrid />
    </main>
  )
}
