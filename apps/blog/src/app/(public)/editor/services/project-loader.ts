'use server'

import { randomBytes } from 'crypto'
import { opendir, readdir, readFile, writeFile } from 'fs/promises'
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
  const name = pkgJson.metadata.displayName ?? id
  const description = pkgJson.description
  const initialFile =
    pkgJson.metadata.initialFile.replace(/^\.?\//, '') ?? 'package.json'

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

// TODO: Remove this after bootstrap refactor
export async function parseProjects(
  projectsDir = '../../../../../../../playground'
) {
  const basePath = resolve(dirname(fileURLToPath(import.meta.url)), projectsDir)
  const entries = await readdir(basePath, { withFileTypes: true })

  const projects = []
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const projectPath = resolve(basePath, entry.name)
      const loaded = await loadProjectFromDir(projectPath)
      projects.push(loaded)
    }
  }

  const output = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../data/projects.json'
  )
  await writeFile(output, JSON.stringify(projects, null, 2))

  return projects
}
