/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { mkdir, readdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import { ArticleMetadata } from './articles'
import { config } from './config'
import { slugify } from './format'

function getReadTime(filepath: string, wordsPerMinute = 200) {
  const wordsCount = readFileSync(filepath).toString().split(/\s+/).length
  return `${Math.ceil(wordsCount / wordsPerMinute)} min`
}

async function write(filename: string, content: object) {
  try {
    await stat(config.metadataDirectory)
  } catch {
    console.log(`⚡️ Creating directory: ${config.metadataDirectory}`)
    await mkdir(config.metadataDirectory, { recursive: true })
  }

  console.log(`⚡️ Writing file: "${filename}"`)
  const filePath = join(config.metadataDirectory, filename)
  const contentJson = JSON.stringify(content, null, 2)
  await writeFile(filePath, contentJson)
}

async function main() {
  console.log(`🚀 Blog Metadata`)
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

  console.log(`✅ Done`)
}

main()
