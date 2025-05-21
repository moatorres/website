'use client'

import { Alert, AlertDescription } from '@shadcn/ui'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { fetchLinkMetadata } from './actions'
import { LinkCard } from './link-card'
import { LinkForm } from './link-form'
import type { LinkMetadata } from './types'

export function LinkCardGrid() {
  const [links, setLinks] = useState<LinkMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved links from localStorage on component mount
  useEffect(() => {
    const savedLinks = localStorage.getItem('savedLinks')
    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks))
      } catch (e) {
        console.error('Failed to parse saved links', e)
        localStorage.removeItem('savedLinks')
      }
    }
  }, [])

  // Save links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedLinks', JSON.stringify(links))
  }, [links])

  const handleAddLink = async (url: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const metadata = await fetchLinkMetadata(url)

      // Check if link already exists
      if (!links.some((link) => link.url === url)) {
        setLinks((prev) => [metadata, ...prev])
      } else {
        setError('This link has already been added')
      }
    } catch (err) {
      setError(
        'Failed to fetch link metadata. Please check the URL and try again.'
      )
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveLink = (url: string) => {
    setLinks((prev) => prev.filter((link) => link.url !== url))
  }

  return (
    <div className="space-y-8">
      <LinkForm onAddLink={handleAddLink} isLoading={isLoading} />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {links.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No links added yet. Add your first link above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <LinkCard
              key={link.url}
              metadata={link}
              onRemove={() => handleRemoveLink(link.url)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
