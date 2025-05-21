'use client'

import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@shadcn/ui'
import { Clock, ExternalLink, Tag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { deleteBookmark } from './actions'

export type BookmarkType = {
  id: string
  url: string
  title: string
  description: string
  image: string
  type: 'website' | 'image' | 'video'
  tags: string[]
  readTime?: number
  createdAt: Date
}

export default function BookmarkCard({ bookmark }: { bookmark: BookmarkType }) {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteBookmark(bookmark.id)
      toast('Bookmark deleted', {
        description: 'Your bookmark has been successfully removed.',
      })
      router.refresh()
    } catch {
      toast('Error', {
        description: 'Failed to delete bookmark.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle mouse enter for the entire card
  const handleMouseEnter = () => {
    setIsHovering(true)

    if (bookmark.type === 'video' && videoRef.current) {
      // Set video to play from the middle
      const duration = videoRef.current.duration
      if (!isNaN(duration) && duration > 0) {
        videoRef.current.currentTime = duration / 2
      }

      // Start playing the video
      const playPromise = videoRef.current.play()

      // Handle potential play() promise rejection
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Video playback failed:', error)
        })
      }
    }
  }

  // Handle mouse leave for the entire card
  const handleMouseLeave = () => {
    setIsHovering(false)

    if (
      bookmark.type === 'video' &&
      videoRef.current &&
      !videoRef.current.paused
    ) {
      videoRef.current.pause()
    }
  }

  // Load video metadata when component mounts
  useEffect(() => {
    if (bookmark.type === 'video' && videoRef.current) {
      const video = videoRef.current

      const handleLoadedData = () => {
        setVideoLoaded(true)
        // Pre-set the currentTime to middle when loaded
        if (video.duration && !isNaN(video.duration)) {
          video.currentTime = video.duration / 2
        }
      }

      video.addEventListener('loadeddata', handleLoadedData)

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData)
      }
    }

    return
  }, [bookmark.type])

  return (
    <Drawer direction="bottom">
      <div
        ref={cardRef}
        className="group relative overflow-hidden h-full flex flex-col"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Main content - just the image/video/website preview */}
        <div className="w-full h-full aspect-square">
          {bookmark.type === 'website' && (
            <div className="w-full h-full">
              <Image
                src={bookmark.image}
                alt={bookmark.title}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {bookmark.type === 'image' && (
            <Image
              src={bookmark.url || '/placeholder.svg'}
              alt={bookmark.title || 'Image bookmark'}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          )}

          {bookmark.type === 'video' && (
            <div className="w-full h-full relative">
              {/* Always render the video element but control visibility with CSS */}
              <video
                ref={videoRef}
                src={bookmark.url}
                className="w-full h-full object-cover absolute inset-0"
                muted
                playsInline
                preload="metadata"
                style={{ opacity: isHovering && videoLoaded ? 1 : 0 }}
              />

              {/* Show thumbnail when not hovering or video not loaded */}
              <Image
                src={bookmark.image || '/placeholder.svg'}
                alt={bookmark.title || 'Video bookmark'}
                width={500}
                height={500}
                className="w-full h-full object-cover"
                style={{ opacity: isHovering && videoLoaded ? 0 : 1 }}
              />
            </div>
          )}
        </div>

        {/* Overlay that appears on hover */}
        <DrawerTrigger className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white text-left w-full pointer-events-auto cursor-pointer">
          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-2">{bookmark.title}</h3>

            <p className="text-sm text-gray-200 mt-1 line-clamp-3">
              {bookmark.description || 'No description available'}
            </p>

            {bookmark.readTime && (
              <div className="flex items-center mt-2 text-xs text-gray-300">
                <Clock className="h-3 w-3 mr-1" />
                <span>{bookmark.readTime} min read</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-auto">
            <div className="flex flex-wrap gap-1">
              {bookmark.tags &&
                bookmark.tags.slice(0, 2).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-white/20 text-white hover:bg-white/30"
                  >
                    {tag}
                  </Badge>
                ))}
              {bookmark.tags && bookmark.tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs text-white border-white/30"
                >
                  +{bookmark.tags.length - 2}
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-white hover:bg-white/20 pointer-events-auto"
            >
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Open link</span>
              </a>
            </Button>
          </div>
        </DrawerTrigger>
      </div>

      <DrawerContent className="sm:max-w-svh backdrop-blur-lg bg-white/80 dark:bg-zinc-900/60 border border-border shadow-xl min-w-[100vw] min-h-[90vh] p-8">
        <DrawerHeader>
          <DrawerTitle>{bookmark.title}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 mt-4">
          {bookmark.type === 'website' && (
            <div className="aspect-video w-full overflow-hidden rounded-md border">
              <iframe
                src={bookmark.url}
                title={bookmark.title}
                className="w-full h-full"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          )}

          {bookmark.type === 'image' && (
            <div className="w-full overflow-hidden rounded-md">
              <Image
                src={bookmark.url || '/placeholder.svg'}
                alt={bookmark.title || 'Image bookmark'}
                width={600}
                height={400}
                className="w-full object-cover max-h-[400px]"
              />
            </div>
          )}

          {bookmark.type === 'video' && (
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <video src={bookmark.url} controls className="w-full h-full" />
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              {bookmark.description || 'No description available'}
            </p>
          </div>

          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                <h4 className="font-medium">Tags</h4>
              </div>
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>Deleting...</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>

            <Button asChild>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Original
              </a>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
