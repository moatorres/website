import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { readdir, writeFile } from 'fs/promises'
import { mkdir, stat } from 'fs/promises'
import { join } from 'path'

import { config, writeConfig } from './config'
import { slugify } from './format'

function getReadTime(filepath: string, wordsPerMinute = 200) {
  const wordsCount = readFileSync(filepath).toString().split(/\s+/).length
  return `${Math.ceil(wordsCount / wordsPerMinute)} min`
}

async function main() {
  try {
    await stat(config.metadataDirectory)
  } catch {
    await mkdir(config.metadataDirectory, { recursive: true })
  }

  await writeConfig()

  const contentFiles = await readdir(config.contentDirectory, {
    withFileTypes: true,
  })

  const collections = contentFiles
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  await writeFile(
    join(config.metadataDirectory, 'collections.json'),
    JSON.stringify(collections, null, 2)
  )

  const metadata = []

  for (const collection of collections) {
    const collectionDirectory = join(config.contentDirectory, collection)

    const collectionFiles = await readdir(collectionDirectory, {
      withFileTypes: true,
    })

    const mdxFiles = collectionFiles.filter((dirent) => dirent.name.endsWith('.mdx'))

    for await (const file of mdxFiles) {
      const filepath = join(collectionDirectory, file.name)
      const content = await import(filepath)
      const slug = slugify(file.name.replace(/\.mdx$/, ''))
      const stats = await import('fs/promises').then((fs) => fs.stat(filepath))
      const articleMetadata = {
        id: randomUUID(),
        ...content.metadata,
        date: new Date(content.metadata.date).toISOString(),
        author: config.author,
        createdAt: new Date(stats.ctime).toISOString(),
        filename: file.name,
        filepath: filepath,
        href: `/journal/${collection}/${slug}`,
        readTime: getReadTime(filepath),
        slug: slug,
        updatedAt: stats.mtime,
      }
      metadata.push(articleMetadata)
    }

    await writeFile(
      join(config.metadataDirectory, `${collection}.collection.json`),
      JSON.stringify(metadata, null, 2)
    )
  }

  await writeFile(
    join(config.metadataDirectory, 'articles.json'),
    JSON.stringify(metadata, null, 2)
  )
}

main()
