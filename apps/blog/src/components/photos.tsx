'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { AspectRatio } from './aspect-ratio'

export type Photo = {
  id?: string
  url: string
  alt: string
}

const gallery: Photo[] = [
  { url: '/images/wave-moa-torres.png', alt: 'Wave on sand' },
  { url: '/images/farol-moa-torres.jpg', alt: 'Farol da Barra' },
  { url: '/images/gloria-moa-torres.jpg', alt: 'Kid smilling' },
  { url: '/images/bamboo-moa-torres.jpg', alt: 'Bamboo' },
]

function Lightbox({
  photo,
  onClose,
}: {
  photo: Photo | null
  onClose: () => void
}) {
  if (!photo) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center  bg-black/70 backdrop-blur-sm" // bg-black/70
      onClick={onClose}
    >
      <div className="relative max-h-screen max-w-screen-lg p-4">
        <div className="relative h-full max-h-[80vh] w-auto">
          <Image
            src={photo.url}
            alt={photo.alt}
            width={1000}
            height={1000}
            className="h-auto max-h-[80vh] w-auto object-contain"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [mounted, setMounted] = useState(false)

  // Handle client-side rendering for the portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load photos
  useEffect(() => {
    setPhotos(gallery)
  }, [])

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
    document.body.style.overflow = 'auto'
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {photos.map((photo, index) => (
          <AspectRatio
            key={index}
            ratio={1 / 1}
            className="cursor-pointer transition-all hover:opacity-90 justify-center"
            onClick={() => openLightbox(photo)}
          >
            <div className="relative w-full h-full">
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                className="object-cover"
              />
            </div>
          </AspectRatio>
        ))}

        {/* Lightbox */}
        {mounted && <Lightbox photo={selectedPhoto} onClose={closeLightbox} />}
      </div>
    </div>
  )
}
