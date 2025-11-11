'use server'

import { randomBytes } from 'crypto'
import { writeFileSync } from 'fs'
import { opendir, readFile } from 'fs/promises'
import { dirname, join, relative, resolve } from 'path'
import { fileURLToPath } from 'url'

import { Project } from './types'

export async function* walk(root: string): AsyncGenerator<string> {
  for await (const entry of await opendir(root)) {
    const fullPath = join(root, entry.name)
    if (entry.isDirectory()) yield* walk(fullPath)
    else if (entry.isFile()) yield fullPath
  }
}

export async function loadProjectFromDir(projectDir: string): Promise<Project> {
  const pkgPath = join(projectDir, 'package.json')
  const pkgJson = JSON.parse(await readFile(pkgPath, 'utf-8'))

  const id = pkgJson.name ?? `prj-${randomBytes(3).toString('hex')}`
  const name = pkgJson.displayName ?? id
  const description = pkgJson.description
  const initialFile = pkgJson.metadata.initialFile

  const files: Record<string, string> = {}
  const ignoredPaths = ['dist', 'node_modules', '.git', '.next']

  for await (const filePath of walk(projectDir)) {
    if (ignoredPaths.some((ignored) => filePath.includes(ignored))) continue
    const relPath = relative(projectDir, filePath)
    const content = await readFile(filePath, 'utf-8')
    files[relPath] = content
  }

  return { id, name, description, initialFile, files }
}

const p = await loadProjectFromDir(
  resolve(dirname(fileURLToPath(import.meta.url)), './projects/effect-atom')
)

writeFileSync('foo.json', JSON.stringify(p))

console.dir(p, { depth: 3 })
