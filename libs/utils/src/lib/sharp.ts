import { readdirSync } from 'fs'
import { basename, extname, join } from 'path'

import sharp from 'sharp'

import { blue, red } from './ansi.js'
import { relativePath } from './format.js'
import * as print from './print.js'

/**
 * Converts images to WebP format.
 * @see https://sharp.pixelplumbing.com/api-output#webp
 */
export async function imageToWebp(
  inputPath: string,
  outputPath: string,
  quality = 80
) {
  try {
    await sharp(inputPath)
      .webp({ quality: Math.max(0, Math.min(100, quality)) }) // quality: 0–100
      .toFile(outputPath)

    print.log(
      `Converting ${blue(relativePath(inputPath))} to ${blue(relativePath(outputPath))}`
    )
  } catch (error) {
    print.error(`Error converting ${red(inputPath)}`, error)
  }
}

/**
 * Converts all JPG files in a directory to WebP format.
 * @param dir The directory containing JPG files.
 */
export async function imageToWebpBatch(
  dir: string,
  extnames: string[] = ['.jpg', '.jpeg'],
  quality = 90
) {
  const files = readdirSync(dir)

  for (const file of files) {
    const ext = extname(file).toLowerCase()
    if (extnames.includes(ext)) {
      const inputPath = join(dir, file)
      const outputPath = join(dir, `${basename(file, ext)}.webp`)
      await imageToWebp(inputPath, outputPath, quality)
    }
  }
}
