/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { randomUUID } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { mkdir, readdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import { green, red } from './ansi'
import { ArticleMetadata } from './articles'
import { getConfig } from './config'
import { slugify } from './format'
import * as print from './print'

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

  await write('config.json', config)

  print.info(
    `Reading ${green(config.contentDirectory.split(process.cwd())?.pop())}`
  )

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

  print.info(
    `Files written to ${green(config.metadataDirectory.split(process.cwd())?.pop())}`
  )

  print.success(`Bootstrap completed successfully ${green('✓')}`)
}

main()
