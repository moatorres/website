import { Dirent, readFileSync } from 'fs'
import { join } from 'path'

import { print, yellow } from '@blog/utils'
import { imageSize } from 'image-size'
import { ISizeCalculationResult } from 'image-size/types/interface'

import config from '../data/config.json'

export type PhotoMetadata = {
  id: number
  src: string
  alt: string
  width: number
  height: number
}

export function extractPhotoMetadata(
  dirent: Dirent,
  index: number
): PhotoMetadata {
  const filepath = join(config.photosDirectory, dirent.name)
  let size: ISizeCalculationResult = { width: 0, height: 0 }

  try {
    size = imageSize(readFileSync(filepath))
  } catch {
    print.warn(
      `Could not read image size for ${yellow(dirent.name)}, skipping.`
    )
  }

  return {
    id: index + 1,
    alt: dirent.name,
    src: join(dirent.parentPath.split('public').pop() ?? '', dirent.name),
    width: size.width,
    height: size.height,
  }
}
