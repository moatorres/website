'use client'

import { Button, Card, CardContent, Input } from '@shadcn/ui'
import { Loader2, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { addBookmark } from './actions'

export default function AddBookmarkForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!url) return

    try {
      setIsLoading(true)
      await addBookmark(url)
      setUrl('')
      toast('Bookmark added', {
        description:
          'Your bookmark has been successfully added to your collection.',
      })
      router.refresh()
    } catch {
      toast('Error', {
        description:
          'Failed to add bookmark. Please check the URL and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {!isFormOpen ? (
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Bookmark
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <Input
                  type="text"
                  placeholder="Enter URL (website, image, or video link)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <p className="text-xs text-muted-foreground">
                  Paste any URL to automatically extract title, description, and
                  preview image
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isLoading}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !url}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Add Bookmark'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
