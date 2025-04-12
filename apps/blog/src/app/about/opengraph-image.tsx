/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { readFile } from 'fs/promises'
import { join } from 'path'

import { ImageResponse } from 'next/og'

export const alt = 'About Moa Torres'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  const interSansBold = await readFile(
    join(process.cwd(), 'src/assets/fonts/inter-sans-bold.ttf')
  )

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        About Moa Torres
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: interSansBold, style: 'normal', weight: 700 },
      ],
    }
  )
}
