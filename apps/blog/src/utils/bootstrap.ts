/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { randomUUID } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { mkdir, readdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import { green, print, red, yellow } from '@blog/utils'
import { imageSize } from 'image-size'
import { ISizeCalculationResult } from 'image-size/types/interface'

import { ArticleMetadata } from './articles'
import { getConfig } from './config'
import { slugify } from './format'
import { PhotoMetadata } from './photos'

function getReadTime(filepath: string, wordsPerMinute = 200) {
  const wordsCount = readFileSync(filepath).toString().split(/\s+/).length
  return `${Math.ceil(wordsCount / wordsPerMinute)} min`
}

const config = getConfig()

async function write(filename: string, content: object) {
  try {
    await stat(config.metadataDirectory)
  } catch {
    print.info(
      `Creating ${green(config.metadataDirectory.split(process.cwd())?.pop())}`
    )
    await mkdir(config.metadataDirectory, { recursive: true })
  }

  print.info(`Writing ${green(filename)}`)
  const filePath = join(config.metadataDirectory, filename)
  const contentJson = JSON.stringify(content, null, 2)
  await writeFile(filePath, contentJson)
}

async function main() {
  if (!existsSync(config.contentDirectory)) {
    print.error(
      `Content directory ${red(config.contentDirectory)} doesn't exist, aborting.`
    )
    process.exit(1)
  }

  print.info(
    `Reading ${green(config.contentDirectory.split(process.cwd())?.pop())}`
  )

  if (!existsSync(config.photosDirectory)) {
    print.error(
      `Photos directory ${red(config.photosDirectory)} doesn't exist, aborting.`
    )
    process.exit(1)
  }

  print.info(
    `Reading ${green(config.photosDirectory.split(process.cwd())?.pop())}`
  )

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
      const content = await import(filepath)
      const slug = slugify(file.name.replace(/\.mdx$/, ''))
      const stats = await import('fs/promises').then((fs) => fs.stat(filepath))

      const articleMetadata: ArticleMetadata = {
        id: randomUUID(),
        slug: slug,
        href: `/${config.contentRoute}/${collection}/${slug}`,
        author: config.author,
        category: content.metadata.category,
        date: content.metadata.date,
        title: content.metadata.title,
        summary: content.metadata.summary,
        fileName: file.name,
        filePath: filepath,
        collection: collection,
        readTime: getReadTime(filepath),
        createdAt: new Date(stats.ctime).toISOString(),
        updatedAt: new Date(stats.mtime).toISOString(),
        publishedAt: new Date(content.metadata.date).toISOString(),
      }
      metadata.push(articleMetadata)
    }

    await write(`${collection}.collection.json`, metadata)
  }

  await write('articles.json', metadata)

  const photosDirectory = await readdir(config.photosDirectory, {
    withFileTypes: true,
  })

  const photos: PhotoMetadata[] = photosDirectory
    .filter((dirent) => dirent.isFile() && !dirent.name.includes('DS_Store'))
    .map((dirent, index) => {
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
    })

  await write('photos.json', photos)

  print.info(
    `Files written to ${green(config.metadataDirectory.split(process.cwd())?.pop())}`
  )

  print.success(`Bootstrap completed successfully ${green('✓')}`)
}

main()
