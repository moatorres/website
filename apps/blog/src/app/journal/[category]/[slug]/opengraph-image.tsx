import { readFile } from 'fs/promises'
import { join } from 'path'

import { ImageResponse } from 'next/og'

import { ContentMetadata } from '@/utils/types'

export const alt = 'Moa Torres'

export const size = {
  width: 1200,
  height: 630,
}

export default async function Image({ params }: { params: { category: string; slug: string } }) {
  const interSansBold = await readFile(join(process.cwd(), 'src/assets/fonts/inter-sans-bold.ttf'))

  let content
  try {
    const collectionMetadata = await import(`@/data/${params.category}.collection.json`)
    const [entry] = collectionMetadata.default.filter(
      (metadata: ContentMetadata) => metadata.slug === params.slug
    )
    content = await import(`@/content/${params.category}/${entry.filename}`)
    content = await import(`@/content/${params.category}/${params.slug}.mdx`)
  } catch {
    return new Response('Not found', { status: 404 })
  }

  const { title, category } = content.metadata

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          backgroundColor: '#1a1a1a',
          color: 'white',
          padding: '50px',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '60px', fontWeight: 'bold', marginBottom: '20px' }}>{title}</h1>
        <h2 style={{ fontSize: '30px', opacity: 0.8 }}>{category}</h2>
      </div>
    ),
    { ...size, fonts: [{ name: 'Inter', data: interSansBold, style: 'normal', weight: 700 }] }
  )
}
