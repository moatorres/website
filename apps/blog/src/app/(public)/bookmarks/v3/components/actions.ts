'use server'

import { randomUUID } from 'crypto'

import { revalidatePath } from 'next/cache'

import type { BookmarkType } from './card'

// In a real application, these functions would interact with a database
// This is a simplified mock implementation

export async function addBookmark(url: string) {
  // Detect the type of content based on URL
  let type: 'website' | 'image' | 'video' = 'website'

  if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
    type = 'image'
  } else if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
    type = 'video'
  }

  // In a real app, we would fetch metadata from the URL
  // For now, we'll simulate this process with a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock metadata extraction
  let title = ''
  let description = ''
  let image = ''
  let tags: string[] = []
  let readTime: number | undefined = undefined

  // Sample images for different types
  const websiteImages = [
    'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1188&auto=format&fit=crop',
  ]

  const videoImages = [
    'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?q=80&w=1171&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1129&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1074&auto=format&fit=crop',
  ]

  if (type === 'website') {
    // In a real app, we would use a service like unfurl.js, open graph, or a custom scraper
    title = 'New Website Bookmark' // This would be extracted from the page
    description =
      'This is a description that would be extracted from the meta tags or content of the page.'
    image = websiteImages[Math.floor(Math.random() * websiteImages.length)]
    tags = ['website', 'bookmark']
    readTime = Math.floor(Math.random() * 10) + 2 // Random read time between 2-12 minutes
  } else if (type === 'image') {
    title = 'New Image Bookmark'
    description = 'A beautiful image'
    image = url // For images, use the URL as the image
    tags = ['image', 'visual']
  } else if (type === 'video') {
    title = 'New Video Bookmark'
    description = 'An interesting video'
    image = videoImages[Math.floor(Math.random() * videoImages.length)]
    tags = ['video', 'media']
    readTime = Math.floor(Math.random() * 15) + 5 // Random watch time between 5-20 minutes
  }

  // In a real app, we would save this to a database
  const newBookmark: BookmarkType = {
    id: randomUUID(),
    url,
    title,
    description,
    image,
    type,
    tags,
    readTime,
    createdAt: new Date(),
  }

  // For demonstration purposes, we'll just revalidate the path
  revalidatePath('/')

  return newBookmark
}

export async function deleteBookmark(id: string) {
  // In a real app, we would delete from a database
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Revalidate the path to refresh the UI
  revalidatePath('/')

  return { success: true }
}

export async function updateBookmark(id: string, data: Partial<BookmarkType>) {
  // In a real app, we would update the database
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Revalidate the path to refresh the UI
  revalidatePath('/')

  return { success: true }
}
