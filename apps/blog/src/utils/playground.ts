import { FileSystem, Path } from '@effect/platform'
import { NodeContext } from '@effect/platform-node'
import { Effect } from 'effect'

import {
  decodePlaygroundConfig,
  isIgnoredPath,
  PLAYGROUND_CONFIG_FILE,
  Project,
} from '../app/(public)/editor/services/types'

/** nx project registration — monorepo infrastructure, never mounted */
const NX_PROJECT_FILE = 'project.json'

/** Project files keyed by workspace-relative path, ignored segments skipped */
const readProjectFiles = (projectDir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const files: Record<string, string> = {}
    const pending = [projectDir]

    for (let i = 0; i < pending.length; i++) {
      const dir = pending[i]
      const entries = [...(yield* fs.readDirectory(dir))].sort()

      for (const name of entries) {
        const fullPath = path.join(dir, name)
        const relPath = path.relative(projectDir, fullPath)
        if (isIgnoredPath(relPath) || relPath === NX_PROJECT_FILE) {
          continue
        }

        const info = yield* fs.stat(fullPath)
        if (info.type === 'Directory') {
          pending.push(fullPath)
        } else if (info.type === 'File') {
          files[relPath] = yield* fs.readFileString(fullPath)
        }
      }
    }

    return Object.fromEntries(
      Object.entries(files).sort(([a], [b]) => a.localeCompare(b))
    )
  })

const loadProject = (projectDir: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path

    const files = yield* readProjectFiles(projectDir)

    if (!('package.json' in files)) {
      return yield* Effect.fail(new Error('project has no package.json'))
    }

    // decode loudly at build time — a broken manifest fails the bootstrap,
    // and a declared main file must exist
    const manifest = files[PLAYGROUND_CONFIG_FILE]

    if (manifest !== undefined) {
      const config = yield* decodePlaygroundConfig(manifest)
      const main = config.main?.replace(/^\.?\//, '')

      if (main && !(main in files)) {
        return yield* Effect.fail(
          new Error(`main "${main}" does not exist in the project`)
        )
      }
    }

    const project: Project = { id: path.basename(projectDir), files }
    return project
  })

const loadAll = (basePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const entries = [...(yield* fs.readDirectory(basePath))].sort()
    const projects: Project[] = []

    for (const name of entries) {
      if (isIgnoredPath(name)) continue
      const dir = path.join(basePath, name)
      const info = yield* fs.stat(dir)
      if (info.type !== 'Directory') continue

      projects.push(
        yield* loadProject(dir).pipe(
          Effect.mapError((error) => new Error(`${dir}: ${error.message}`))
        )
      )
    }

    return projects
  })

/**
 * Loads every playground project for the bootstrap pipeline. Invalid
 * configuration fails the build with a schema parse error instead of
 * shipping a broken projects.json.
 */
export const loadPlaygroundProjects = (basePath: string): Promise<Project[]> =>
  Effect.runPromise(loadAll(basePath).pipe(Effect.provide(NodeContext.layer)))
