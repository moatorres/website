'use client'

import { Button, Card, CardContent, CardFooter } from '@shadcn/ui'
import { ExternalLink, Trash2 } from 'lucide-react'
import Image from 'next/image'

import type { LinkMetadata } from './types'

interface LinkCardProps {
  metadata: LinkMetadata
  onRemove: () => void
}

export function LinkCard({ metadata, onRemove }: LinkCardProps) {
  const { title, description, image, url, siteName, favicon } = metadata

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {image ? (
          <Image
            src={image || '/placeholder.svg'}
            alt={title || 'Link preview'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      <CardContent className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          {favicon && (
            <div className="w-4 h-4 overflow-hidden flex-shrink-0">
              <Image
                src={favicon || '/placeholder.svg'}
                alt={siteName || 'Site icon'}
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate">
            {siteName || new URL(url).hostname}
          </span>
        </div>

        <h3 className="font-semibold line-clamp-2 mb-2">
          {title || 'Untitled Link'}
        </h3>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, '_blank')}
          className="gap-1"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Remove</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
