'use client'

import { Button, Input } from '@shadcn/ui'
import { Loader2 } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

interface LinkFormProps {
  onAddLink: (url: string) => Promise<void>
  isLoading: boolean
}

export function LinkForm({ onAddLink, isLoading }: LinkFormProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic URL validation
    if (!url.trim()) return

    try {
      // Ensure URL has protocol
      let formattedUrl = url
      if (!/^https?:\/\//i.test(url)) {
        formattedUrl = `https://${url}`
      }

      await onAddLink(formattedUrl)
      setUrl('')
    } catch (error) {
      console.error('Error adding link:', error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-3xl mx-auto space-x-2"
    >
      <Input
        type="text"
        placeholder="Enter a URL (e.g., https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !url.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </>
        ) : (
          'Add Link'
        )}
      </Button>
    </form>
  )
}
