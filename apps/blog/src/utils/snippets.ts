import { randomUUID } from 'crypto'
import { readdirSync } from 'fs'
import { readFile, stat } from 'fs/promises'
import { basename, join } from 'path'
import { fileURLToPath } from 'url'

import { build } from 'esbuild'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const SNIPPET_SRC_DIR = join(__dirname, '../content/snippets')
const SNIPPET_OUT_DIR = join(__dirname, '../../public/_snippets')

export async function extractSnippetMetadata(
  snippetsDirectory = SNIPPET_SRC_DIR
) {
  const snippetFiles = readdirSync(snippetsDirectory).filter((f) =>
    f.endsWith('.ts')
  )

  const metadataList = await Promise.all(
    snippetFiles.map(async (file) => {
      const name = basename(file, '.ts')
      const meta = join(snippetsDirectory, `${name}.json`)
      const input = join(snippetsDirectory, file)
      const output = join(SNIPPET_OUT_DIR, `${name}.js`)
      const stats = await stat(input)

      await build({
        entryPoints: [input],
        bundle: true,
        platform: 'node',
        outfile: output,
        format: 'cjs',
        external: [],
      })

      const metadata = await import(`file://${meta}`)

      if (!metadata) {
        throw new Error(`No metadata found for ${name} (${meta})`)
      }

      return {
        id: randomUUID(),
        date: metadata.date,
        slug: name,
        href: `/snippets/${name}`,
        filepath: output,
        ...metadata.default,
        code: await readFile(input, 'utf-8'),
        createdAt: new Date(stats.ctime).toISOString(),
        updatedAt: new Date(stats.mtime).toISOString(),
      }
    })
  )

  return metadataList
}
