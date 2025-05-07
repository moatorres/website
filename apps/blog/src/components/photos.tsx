/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { cx, Skeleton } from '@blog/ui'
import Image from 'next/image'
import React from 'react'
import { createPortal } from 'react-dom'

import photos from '@/data/photos.json'
import { PhotoMetadata } from '@/utils/photos'

import { AspectRatio } from './aspect-ratio'

type LightboxProps = {
  photo: PhotoMetadata | null
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
}

export function Lightbox({ photo, onClose, onNext, onPrev }: LightboxProps) {
  const touchStartX = React.useRef<number | null>(null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowRight':
          onNext?.()
          break
        case 'ArrowLeft':
          onPrev?.()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrev])

  // touch swipe bindings
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const touchEndX = e.changedTouches[0].clientX
      const diff = touchStartX.current - touchEndX

      if (diff > 50) {
        // swipe left
        onNext?.()
      } else if (diff < -50) {
        // swipe right
        onPrev?.()
      }
      touchStartX.current = null
    },
    [onNext, onPrev]
  )

  if (!photo) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative max-h-screen max-w-screen-lg p-4">
        <div className="relative h-full max-h-[80vh] w-auto">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className={cx(
              'h-auto max-h-[80vh] w-auto object-contain',
              photo.height <= 1080 && 'md:scale-150'
            )}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

export function PhotoGallery() {
  const [gallery, setGallery] = React.useState<PhotoMetadata[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  // handle client-side rendering for the portal
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // load photos
  React.useEffect(() => {
    setGallery(photos)
  }, [])

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
    document.body.style.overflow = 'auto'
  }

  const showNext = () => {
    setSelectedIndex((prev) =>
      prev !== null && prev < gallery.length - 1 ? prev + 1 : prev
    )
  }

  const showPrev = () => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
  }

  const selectedPhoto = selectedIndex !== null ? gallery[selectedIndex] : null

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {gallery.map((photo, index) => (
          <AspectRatio
            key={index}
            ratio={1 / 1}
            className="cursor-pointer transition-all hover:opacity-90 justify-center"
            onClick={() => openLightbox(index)}
          >
            <div className="relative w-full h-full">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                style={{ visibility: loading ? 'hidden' : 'visible' }}
                onError={() => setLoading(false)}
                onLoadingComplete={() => setLoading(false)}
              />
              <Skeleton
                className={cx(
                  'hidden object-cover h-80 w-80 bg-accent',
                  loading && 'inline-block'
                )}
              />
            </div>
          </AspectRatio>
        ))}

        {mounted && selectedPhoto && (
          <Lightbox
            photo={selectedPhoto}
            onClose={closeLightbox}
            onNext={showNext}
            onPrev={showPrev}
          />
        )}
      </div>
    </div>
  )
}
