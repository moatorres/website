/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { AspectRatio, Skeleton } from '@shadcn/ui'
import React from 'react'

import { PhotoGallery } from '@/components/photos'

export default function PhotosPage() {
  return (
    <React.Suspense
      fallback={
        <AspectRatio ratio={1 / 1}>
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      }
    >
      <PhotoGallery />
    </React.Suspense>
  )
}
