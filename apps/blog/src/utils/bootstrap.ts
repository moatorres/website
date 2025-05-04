/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { existsSync } from 'fs'
import { mkdir, readdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import { green, print, red, relativePath } from '@blog/utils'

import { extractArticleMetadata } from './articles'
import { getConfig } from './config'
import { extractPhotoMetadata, PhotoMetadata } from './photos'

const config = getConfig()

function findOrExit(path: string, label = 'File') {
  if (!existsSync(path)) {
    print.error(`${label} ${red(path)} not found, aborting.`)
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

  print.info(
    `Files written to ${green(relativePath(config.metadataDirectory))}`
  )

  print.success(`Bootstrap completed successfully ${green('✓')}`)
}

main()
