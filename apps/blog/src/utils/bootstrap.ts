/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { randomUUID } from 'crypto'
import { Dirent, existsSync, readFileSync } from 'fs'
import { mkdir, readdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import { green, print, red, relativePath, slugify, yellow } from '@blog/utils'
import { imageSize } from 'image-size'
import { ISizeCalculationResult } from 'image-size/types/interface'

import { ArticleMetadata } from '@/lib/articles'
import { PhotoMetadata } from '@/lib/photos'

import { getConfig } from './config'
import { extractSnippetMetadata } from './snippets'

const config = getConfig()

/**
 * Calculates the read time of an article based on its word count.
 * @returns The estimated read time in minutes.
 */
export function getReadTime(filepath: string, wordsPerMinute = 200) {
  const wordsCount = readFileSync(filepath).toString().split(/\s+/).length
  return `${Math.ceil(wordsCount / wordsPerMinute)} min`
}

/**
 * Extracts metadata from an article file and returns it as an object.
 * @throws {Error} If the file cannot be read or the content is not valid JSON.
 */
export async function extractArticleMetadata(
  filepath: string,
  fileName: string,
  collection: string
): Promise<ArticleMetadata> {
  const slug = slugify(fileName.replace(/\.mdx$/, ''))
  const content = await import(filepath)
  const stats = await stat(filepath)

  return {
    id: randomUUID(),
    slug,
    href: `/${config.contentRoute}/${collection}/${slug}`,
    author: config.author,
    category: content.metadata.category,
    date: content.metadata.date,
    title: content.metadata.title,
    summary: content.metadata.summary,
    fileName,
    filePath: filepath,
    collection,
    readTime: getReadTime(filepath),
    createdAt: new Date(stats.ctime).toISOString(),
    updatedAt: new Date(stats.mtime).toISOString(),
    publishedAt: new Date(content.metadata.date).toISOString(),
  }
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

function findOrExit(path: string, label = 'File') {
  if (!existsSync(path)) {
    print.error(`${label} ${red(path)} doesn't exist, aborting.`)
    process.exit(1)
  }
  print.info(`Reading ${green(relativePath(path))}`)
  return true
}

async function write(filename: string, content: object) {
  try {
    await stat(config.metadataDirectory)
  } catch {
    print.info(`Creating ${green(relativePath(config.metadataDirectory))}`)
    await mkdir(config.metadataDirectory, { recursive: true })
  }

  print.info(`Writing ${green(filename)}`)
  const filePath = join(config.metadataDirectory, filename)
  const contentJson = JSON.stringify(content, null, 2)
  await writeFile(filePath, contentJson)
}

async function main() {
  const requiredDiretories = [
    { label: 'Content directory', path: config.contentDirectory },
    { label: 'Photos directory', path: config.photosDirectory },
    { label: 'Snippets directory', path: config.snippetsDirectory },
  ]

  for (const directory of requiredDiretories) {
    findOrExit(directory.path, directory.label)
  }

  await write('config.json', config)

  const contentFiles = await readdir(config.contentDirectory, {
    withFileTypes: true,
  })

  const collections = contentFiles
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  await write('collections.json', collections)

  const metadata = []

  for (const collection of collections) {
    const collectionDirectory = join(config.contentDirectory, collection)
    const collectionFiles = await readdir(collectionDirectory, {
      withFileTypes: true,
    })

    const mdxFiles = collectionFiles.filter((dirent) =>
      dirent.name.endsWith('.mdx')
    )

    for await (const file of mdxFiles) {
      const filepath = join(collectionDirectory, file.name)
      metadata.push(
        await extractArticleMetadata(filepath, file.name, collection)
      )
    }

    await write(`${collection}.collection.json`, metadata)
  }

  await write('articles.json', metadata)

  const photosDirectory = await readdir(config.photosDirectory, {
    withFileTypes: true,
  })

  const photos: PhotoMetadata[] = photosDirectory
    .filter((dirent) => dirent.isFile() && !dirent.name.includes('DS_Store'))
    .map(extractPhotoMetadata)

  await write('photos.json', photos)

  const snippets = await extractSnippetMetadata(config.snippetsDirectory)

  await write('snippets.json', snippets)

  print.info(
    `Files written to ${green(relativePath(config.metadataDirectory))}`
  )

  print.success(`Bootstrap completed successfully ${green('✓')}`)
}

main()
