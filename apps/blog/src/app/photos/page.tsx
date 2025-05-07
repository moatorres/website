/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { Skeleton } from '@blog/ui'
import React, { Suspense } from 'react'

import { AspectRatio } from '@/components/aspect-ratio'
import { PageSection } from '@/components/page'
import { PhotoGallery } from '@/components/photos'

export default function PhotosPage() {
  return (
    <PageSection>
      <Suspense
        fallback={
          <AspectRatio ratio={1 / 1}>
            <Skeleton className="h-full w-full" />
          </AspectRatio>
        }
      >
        <PhotoGallery />
      </Suspense>
    </PageSection>
  )
}
