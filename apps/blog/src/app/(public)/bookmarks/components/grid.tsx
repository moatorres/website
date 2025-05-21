import { AspectRatio } from '@shadcn/ui'

import BookmarkCard, { BookmarkType } from './card'

// This is a mock data function that would be replaced with a real database in production
export async function getBookmarks(): Promise<BookmarkType[]> {
  // In a real app, this would fetch from a database
  return [
    {
      id: '1',
      url: 'https://antfu.me/',
      title: 'Next.js - The React Framework',
      description:
        'Next.js by Vercel is the React framework for production - it makes building fullstack React apps and sites a breeze and ships with built-in SSR.',
      image:
        'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1170&auto=format&fit=crop',
      type: 'website',
      tags: ['react', 'framework', 'javascript'],
      readTime: 5,
      createdAt: new Date(),
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1170&auto=format&fit=crop',
      title: 'Beautiful Mountain Landscape',
      description:
        'A stunning landscape photograph showing mountains and lakes in the wilderness.',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1170&auto=format&fit=crop',
      type: 'image',
      tags: ['photography', 'nature', 'landscape'],
      createdAt: new Date(),
    },
    {
      id: '3',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: 'Big Buck Bunny',
      description:
        'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
      image:
        'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?q=80&w=1171&auto=format&fit=crop',
      type: 'video',
      tags: ['animation', 'short film'],
      readTime: 10,
      createdAt: new Date(),
    },
    {
      id: '4',
      url: 'https://vercel.com',
      title: 'Vercel: Develop. Preview. Ship.',
      description:
        'Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.',
      image:
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1170&auto=format&fit=crop',
      type: 'website',
      tags: ['hosting', 'deployment', 'platform'],
      readTime: 3,
      createdAt: new Date(),
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1170&auto=format&fit=crop',
      title: 'Modern Architecture Design',
      description:
        'Sleek lines and innovative materials define this modern architectural masterpiece.',
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1170&auto=format&fit=crop',
      type: 'image',
      tags: ['architecture', 'design', 'modern'],
      createdAt: new Date(),
    },
    {
      id: '6',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      title: 'Elephants Dream',
      description: 'The first Blender Open Movie from 2006.',
      image:
        'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1129&auto=format&fit=crop',
      type: 'video',
      tags: ['animation', 'blender', 'open source'],
      readTime: 15,
      createdAt: new Date(),
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1504198322253-cfa87a0ff60f?q=80&w=1287&auto=format&fit=crop',
      title: 'Sunset Over the Ocean',
      description: 'A breathtaking sunset view over the calm ocean waters.',
      image:
        'https://images.unsplash.com/photo-1504198322253-cfa87a0ff60f?q=80&w=1287&auto=format&fit=crop',
      type: 'image',
      tags: ['nature', 'sunset', 'ocean'],
      createdAt: new Date(),
    },
    {
      id: '8',
      url: 'https://github.com',
      title: 'GitHub: Where the world builds software',
      description:
        'GitHub is where over 100 million developers shape the future of software, together.',
      image:
        'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1188&auto=format&fit=crop',
      type: 'website',
      tags: ['development', 'git', 'collaboration'],
      readTime: 4,
      createdAt: new Date(),
    },
    {
      id: '9',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'For Bigger Blazes',
      description:
        'HBO GO now works with Chromecast -- the easiest way to enjoy online video on your TV.',
      image:
        'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1074&auto=format&fit=crop',
      type: 'video',
      tags: ['entertainment', 'streaming', 'technology'],
      readTime: 8,
      createdAt: new Date(),
    },
    {
      id: '10',
      url: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?q=80&w=1287&auto=format&fit=crop',
      title: 'Abstract Digital Art',
      description:
        'Vibrant colors and shapes create a mesmerizing abstract digital artwork.',
      image:
        'https://images.unsplash.com/photo-1682687982501-1e58ab814714?q=80&w=1287&auto=format&fit=crop',
      type: 'image',
      tags: ['art', 'digital', 'abstract'],
      createdAt: new Date(),
    },
  ]
}

export async function getBookmarkById(
  id: string
): Promise<BookmarkType | null> {
  const bookmarks = await getBookmarks()
  return bookmarks.find((bookmark) => bookmark.id === id) || null
}

export default async function BookmarkGrid({
  filter = 'all',
}: {
  filter?: string
}) {
  const bookmarks = await getBookmarks()

  const filteredBookmarks =
    filter === 'all'
      ? bookmarks
      : bookmarks.filter((bookmark) => bookmark.type === filter)

  if (filteredBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No bookmarks found</h3>
        <p className="text-muted-foreground mt-1">
          Add your first bookmark by pasting a URL above.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
      {filteredBookmarks.map((bookmark) => (
        <AspectRatio key={bookmark.id} ratio={1 / 1}>
          <BookmarkCard bookmark={bookmark} />
        </AspectRatio>
      ))}
    </div>
  )
}
