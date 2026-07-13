import { Either, Schema } from 'effect'

/**
 * Path segments excluded from every workspace snapshot. The build-time
 * loader (bootstrap) and the runtime file walker share this policy so the
 * file tree, projects.json, and share links agree on what a project is.
 * Other dotfiles (.gitignore, .npmrc, ...) stay visible on purpose.
 */
export const IGNORED_SEGMENTS: ReadonlySet<string> = new Set([
  '.git',
  '.next',
  '.DS_Store',
  'node_modules',
  'dist',
])

/** true when any segment of a '/'-separated path is ignored */
export const isIgnoredPath = (path: string): boolean =>
  path.split('/').some((segment) => IGNORED_SEGMENTS.has(segment))

export interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileNode[]
  content?: string
}

/**
 * A runnable entry point declared by a project. Projects without one get no
 * Run button — the toolbar only offers what the project can honor.
 */
export const ProjectRun = Schema.Struct({
  /** command executed in the project's shell, e.g. "npm run dev" */
  command: Schema.String,
  /** short label for tooltips/toasts; defaults to the command */
  label: Schema.optional(Schema.String),
  /**
   * true when the command starts a long-running server — enables the
   * preview panel, the Stop button, and the server status lifecycle.
   * One-shot scripts leave this false and just stream to the terminal.
   */
  server: Schema.optional(Schema.Boolean),
})
export type ProjectRun = typeof ProjectRun.Type

/**
 * The project's editor manifest — a real file in the workspace, so it is
 * mounted, shared, and user-editable. Run/prepare re-derive from it live.
 */
export const PLAYGROUND_CONFIG_FILE = 'playground.json'

export const PlaygroundConfig = Schema.Struct({
  /** display name shown in the project selector; defaults to the package name */
  name: Schema.optional(Schema.String),
  /** file opened when the project loads; defaults to package.json */
  main: Schema.optional(Schema.String),
  /** workspace setup command that runs after mount; defaults to pnpm install */
  prepare: Schema.optional(Schema.String),
  run: Schema.optional(ProjectRun),
})
export type PlaygroundConfig = typeof PlaygroundConfig.Type

/** decode playground.json source; Left while the user is mid-edit */
export const decodePlaygroundConfig = Schema.decodeEither(
  Schema.parseJson(PlaygroundConfig)
)

/**
 * The workspace model — an id and its files, nothing else. All metadata
 * (name, main file, prepare, run) lives in the manifest INSIDE files, so
 * there is exactly one source of truth and share links, localStorage saves,
 * and the container all carry it by construction.
 */
export const Project = Schema.Struct({
  id: Schema.String,
  files: Schema.Record({ key: Schema.String, value: Schema.String }),
})
export type Project = typeof Project.Type

/**
 * The manifest is a live file the user edits in the workspace — mid-edit it
 * is often invalid JSON, so the last good config sticks until it parses
 * again. A missing manifest yields null (no config → no Run button).
 */
export function parsePlaygroundConfig(
  files: Record<string, string>,
  previous: PlaygroundConfig | null = null
): PlaygroundConfig | null {
  const source = files[PLAYGROUND_CONFIG_FILE]
  if (source === undefined) return null
  const decoded = decodePlaygroundConfig(source)
  return Either.isRight(decoded) ? decoded.right : previous
}

/** file opened when a workspace loads: the manifest's main, else package.json */
export function initialFileOf(
  files: Record<string, string>,
  config: PlaygroundConfig | null = parsePlaygroundConfig(files)
): string {
  const main = config?.main?.replace(/^\.?\//, '')
  return main && main in files ? main : 'package.json'
}

export interface ProjectMeta {
  name: string
  description: string
}

const metaCache = new WeakMap<Project, ProjectMeta>()

/** display metadata: manifest name, npm-standard package.json description */
export function projectMeta(project: Project): ProjectMeta {
  const cached = metaCache.get(project)
  if (cached) return cached

  let description = ''
  try {
    description =
      JSON.parse(project.files['package.json'] ?? '{}').description ?? ''
  } catch {
    // package.json mid-edit or absent — no description
  }

  const meta = {
    name: parsePlaygroundConfig(project.files)?.name ?? project.id,
    description,
  }
  metaCache.set(project, meta)
  return meta
}
