import { Array, Effect, Either, GlobalValue, Ref, Stream } from 'effect'

import { IGNORED_SEGMENTS, Project } from './types.js'
import {
  convertFilesToFileTree,
  getWebContainerInstance,
  resetWebContainerInstance,
} from './webcontainer.js'

const WEBCONTAINER_BIN_PATH = 'node_modules/.bin:/usr/local/bin:/usr/bin:/bin'

const semaphore = GlobalValue.globalValue('WebContainerService/Semaphore', () =>
  Effect.unsafeMakeSemaphore(1)
)

export class WebContainerService extends Effect.Service<WebContainerService>()(
  'WebContainerService',
  {
    scoped: Effect.gen(function* () {
      yield* Effect.acquireRelease(semaphore.take(1), () =>
        semaphore.release(1)
      )

      const container = yield* Effect.acquireRelease(
        Effect.promise(() => getWebContainerInstance()),
        (container) =>
          Effect.sync(() => {
            container.teardown()
            resetWebContainerInstance()
          })
      )

      /**
       * Each project mounts into its own directory (mountPoint: project.id).
       * Switching projects changes this ref instead of wiping the container
       * filesystem — installs and user edits survive switching away and back.
       */
      const activeDir = yield* Ref.make<string | null>(null)

      /** resolve a project-relative path against the active workspace dir */
      const workspacePath = (path: string) =>
        Ref.get(activeDir).pipe(
          Effect.map((dir) => {
            const clean = path.replace(/^\/+/, '')
            return dir ? `/${dir}/${clean}` : `/${clean}`
          })
        )

      const createShell = Effect.acquireRelease(
        Effect.promise(() =>
          container.spawn('jsh', [], {
            env: { PATH: WEBCONTAINER_BIN_PATH, NODE_NO_WARNINGS: '1' },
          })
        ),
        (process) => Effect.sync(() => process.kill())
      )

      const spawn = (command: string, options?: { cwd?: string }) => {
        return Effect.acquireRelease(
          Effect.promise(() =>
            container.spawn('jsh', ['-c', command], {
              cwd: options?.cwd,
              env: { PATH: WEBCONTAINER_BIN_PATH },
            })
          ),
          (process) => Effect.sync(() => process.kill())
        )
      }

      const run = (
        command: string,
        options?: { cwd?: string; onOutput?: (chunk: string) => void }
      ) => {
        return spawn(command, options).pipe(
          Effect.flatMap((process) => {
            if (options?.onOutput) {
              const write = options.onOutput
              void process.output
                .pipeTo(
                  new WritableStream({
                    write(chunk) {
                      write(chunk)
                    },
                  })
                )
                .catch(() => void 0)
            }
            return Effect.promise(() => process.exit)
          }),
          Effect.scoped
        )
      }

      // raw fs helpers used internally with container-absolute paths
      const readFileRaw = (path: string) =>
        Effect.promise(() => container.fs.readFile(path)).pipe(
          Effect.map((bytes) => new TextDecoder().decode(bytes))
        )

      const readDirectoryRaw = (path: string) =>
        Effect.promise(() =>
          container.fs.readdir(path, { withFileTypes: true })
        )

      // public fs ops take project-relative paths
      const readFile = (path: string) =>
        workspacePath(path).pipe(Effect.flatMap(readFileRaw))

      const readDirectory = (path: string) =>
        workspacePath(path).pipe(Effect.flatMap(readDirectoryRaw))

      const writeFile = (path: string, content: string) =>
        workspacePath(path).pipe(
          Effect.flatMap((p) =>
            Effect.promise(() => container.fs.writeFile(p, content))
          )
        )

      const renameFile = (oldPath: string, newPath: string) =>
        Effect.all([workspacePath(oldPath), workspacePath(newPath)]).pipe(
          Effect.flatMap(([from, to]) =>
            Effect.promise(() => container.fs.rename(from, to))
          )
        )

      const removeFile = (path: string) =>
        workspacePath(path).pipe(
          Effect.flatMap((p) =>
            Effect.promise(() =>
              container.fs.rm(p, { force: true, recursive: true })
            )
          )
        )

      const mkdir = (path: string, options = { recursive: false }) =>
        workspacePath(path).pipe(
          Effect.flatMap((p) =>
            // fs.mkdir's overloads take a literal true/false, not boolean
            Effect.promise(async () => {
              if (options.recursive) {
                await container.fs.mkdir(p, { recursive: true })
              } else {
                await container.fs.mkdir(p)
              }
            })
          )
        )

      const watchFile = (path: string) => {
        const changes = (p: string) =>
          Stream.async((emit) => {
            const watcher = container.fs.watch(p, () => {
              emit.single(void 0)
            })
            return Effect.sync(() => watcher.close())
          }).pipe(Stream.mapEffect(() => readFileRaw(p)))

        return Stream.fromEffect(workspacePath(path)).pipe(
          Stream.flatMap((p) =>
            readFileRaw(p).pipe(Stream.concat(changes(p)), Stream.changes)
          )
        )
      }

      /**
       * Mounts the project into its own directory and makes it the active
       * workspace. No clearing — other projects' directories are untouched.
       */
      const mount = (project: Project) =>
        Effect.gen(function* () {
          yield* Effect.promise(() =>
            container.fs.mkdir(project.id, { recursive: true })
          )
          yield* Effect.promise(() =>
            container.mount(convertFilesToFileTree(project.files), {
              mountPoint: project.id,
            })
          )
          yield* Ref.set(activeDir, project.id)
        })

      const setActiveProject = (id: string | null) => Ref.set(activeDir, id)

      const getActiveProject = Ref.get(activeDir)

      const clearFileSystem = () =>
        Effect.gen(function* () {
          const entries = yield* readDirectoryRaw('/')
          yield* Effect.forEach(
            entries,
            (entry) =>
              Effect.promise(() =>
                container.fs.rm(`/${entry.name}`, {
                  recursive: true,
                  force: true,
                })
              ),
            { concurrency: entries.length, discard: true }
          )
        })

      /**
       * Snapshot of the active workspace: file contents and directory list,
       * both with workspace-relative paths.
       */
      const readAllFiles = () =>
        Effect.gen(function* () {
          const dir = yield* Ref.get(activeDir)
          const base = dir ? `/${dir}` : '/'
          const relative = (full: string) =>
            base === '/' ? full.slice(1) : full.slice(base.length + 1)

          const acc: { files: Record<string, string>; directories: string[] } =
            { files: {}, directories: [] }

          const walk = (path: string): Effect.Effect<void> =>
            readDirectoryRaw(path).pipe(
              Effect.map((entries) =>
                Array.partitionMap(entries, (entry) =>
                  entry.isDirectory()
                    ? Either.right(entry.name)
                    : Either.left(entry.name)
                )
              ),
              Effect.flatMap(([fileNames, dirNames]) => {
                const fullPath = (name: string) =>
                  path === '/' ? `/${name}` : `${path}/${name}`

                const filteredFiles = fileNames.filter(
                  (n) => !IGNORED_SEGMENTS.has(n)
                )
                const filteredDirs = dirNames.filter(
                  (n) => !IGNORED_SEGMENTS.has(n)
                )

                return Effect.all(
                  [
                    Effect.forEach(
                      filteredFiles,
                      (name) =>
                        readFileRaw(fullPath(name)).pipe(
                          Effect.tap((content) => {
                            acc.files[relative(fullPath(name))] = content
                          })
                        ),
                      { concurrency: filteredFiles.length, discard: true }
                    ),
                    Effect.forEach(
                      filteredDirs,
                      (name) => {
                        acc.directories.push(relative(fullPath(name)))
                        return walk(fullPath(name))
                      },
                      { concurrency: filteredDirs.length, discard: true }
                    ),
                  ],
                  { discard: true }
                )
              })
            )

          yield* walk(base)
          return acc
        })

      const watchFileSystem = (ignoreIf?: () => boolean) => {
        const changes = Stream.async((emit) => {
          const watcher = container.fs.watch('/', { recursive: true }, () => {
            if (!ignoreIf?.()) emit.single(void 0)
          })
          return Effect.sync(() => watcher.close())
        }).pipe(
          Stream.debounce(200),
          Stream.mapEffect(() => readAllFiles())
        )

        return readAllFiles().pipe(Stream.concat(changes), Stream.changes)
      }

      return {
        container,
        createShell,
        spawn,
        run,
        readFile,
        readDirectory,
        writeFile,
        renameFile,
        removeFile,
        mkdir,
        watchFile,
        mount,
        setActiveProject,
        getActiveProject,
        readAllFiles,
        watchFileSystem,
        clearFileSystem,
      } as const
    }),
  }
) {}

// const program = Effect.gen(function* () {
//   const service = yield* WebContainerService
//   yield* Effect.log(service.readAllFiles())
// })

// const runnable = program.pipe(Effect.provide(WebContainerService.Default))

// Effect.runFork(runnable)
