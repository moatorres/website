'use client'

import type { WebContainer, WebContainerProcess } from '@webcontainer/api'
import type { FitAddon } from '@xterm/addon-fit'
import type { Terminal as XTerm } from '@xterm/xterm'
import { Effect, Fiber, Stream } from 'effect'
import { File, Folder } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

import { useProjectStore } from '../atoms/project-store'
import { useStatusBar } from '../atoms/status'
import { wcRuntime } from '../services/runtime'
import type { Project } from '../services/types'
import { truncateFromStart } from '../services/utils.js'
import { WebContainerService } from '../services/WebContainerService'

const WEBCONTAINER_BIN_PATH = 'node_modules/.bin:/usr/local/bin:/usr/bin:/bin'

const withService = <A,>(
  f: (svc: WebContainerService) => Effect.Effect<A>
): Promise<A> => wcRuntime.runPromise(Effect.flatMap(WebContainerService, f))

interface WebContainerContextType {
  webcontainer: WebContainer | null

  // State
  isInstalling: boolean
  /** true once a shell exists to receive commands — Run should wait for it */
  isShellReady: boolean
  /**
   * true from stopCommand until the server's port actually closes — input
   * typed into the shell before then is eaten by the dying foreground
   * process, so Run must wait this out
   */
  isStopping: boolean
  previewUrl: string | null
  setPreviewUrl: (url: string | null) => void

  // Terminal
  attachTerminal: (xterm: XTerm, fitAddon: FitAddon) => Promise<void>
  /**
   * Run the project's prepare command (default: pnpm install) in its
   * workspace directory as a scoped process, and point the shell at it
   */
  prepareProject: (project: Project) => Promise<void>
  runCommand: (command: string) => Promise<void>
  /** Interrupt the shell's foreground process (Ctrl+C) and clear the preview */
  stopCommand: () => Promise<void>

  // File operations
  writeFile: (path: string, content: string) => Promise<void>
  createFile: (path: string) => Promise<void>
  createFolder: (path: string) => Promise<void>
  deleteItem: (path: string, isDirectory: boolean) => Promise<void>
  renameItem: (
    oldPath: string,
    newPath: string,
    isDirectory: boolean
  ) => Promise<void>
  moveItem: (
    sourcePath: string,
    targetPath: string,
    isDirectory: boolean
  ) => Promise<void>
  setupFileWatcher: (
    onChange: (data: {
      files: Record<string, string>
      directories: string[]
    }) => void
  ) => () => void
}

const WebContainerContext = createContext<WebContainerContextType | null>(null)

export function WebContainerProvider({ children }: { children: ReactNode }) {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isShellReady, setIsShellReady] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [previewUrl, setPreviewUrlState] = useState<string | null>(null)

  const attachedTerminalRef = useRef<XTerm | null>(null)
  const shellWriterRef = useRef<WritableStreamDefaultWriter | null>(null)
  const ownedProcessesRef = useRef<WebContainerProcess[]>([])
  const activeDirRef = useRef<string | null>(null)
  const prepareSeqRef = useRef(0)
  const isInstallingRef = useRef(false)
  const serverListenerRef = useRef(false)
  const serverPortRef = useRef<number | null>(null)
  const stoppingRef = useRef(false)
  const stopCapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const finishStopping = useCallback(() => {
    stoppingRef.current = false
    setIsStopping(false)
    if (stopCapTimerRef.current) {
      clearTimeout(stopCapTimerRef.current)
      stopCapTimerRef.current = null
    }
  }, [])

  const setPreviewUrl = useCallback((url: string | null) => {
    setPreviewUrlState(url)
  }, [])

  // Boot the container once and listen for server-ready events
  useEffect(() => {
    let cancelled = false

    wcRuntime
      .runPromise(WebContainerService)
      .then((svc) => {
        if (cancelled) return

        setWebcontainer(svc.container)

        if (!serverListenerRef.current) {
          serverListenerRef.current = true

          svc.container.on('server-ready', (port, url) => {
            serverPortRef.current = port
            setPreviewUrl(url)
            toast('Server Ready', {
              description: `Preview available on port ${port}`,
              duration: 3000,
            })
          })

          // the port closing is the real "server is gone" signal — it ends
          // a pending stop and catches servers stopped from the terminal or
          // crashing on their own, so the Stop button never goes stale
          svc.container.on('port', (port, type) => {
            if (type !== 'close' || port !== serverPortRef.current) return

            serverPortRef.current = null
            setPreviewUrl(null)

            if (stoppingRef.current) {
              // small buffer for the process to fully exit and the shell
              // prompt to come back before Run is allowed again
              setTimeout(finishStopping, 500)
            }
          })
        }
      })
      .catch((error) => {
        console.error('WebContainer initialization error:', error)
      })

    return () => {
      cancelled = true
    }
  }, [setPreviewUrl])

  const attachTerminal = useCallback(async (xterm: XTerm) => {
    if (attachedTerminalRef.current === xterm) return
    attachedTerminalRef.current = xterm

    // retire processes owned by a previous terminal instance — they would
    // keep writing into a disposed xterm and hold the shell/dev server alive
    shellWriterRef.current = null
    setIsShellReady(false)
    for (const process of ownedProcessesRef.current) {
      try {
        process.kill()
      } catch (error) {
        console.warn('Failed to kill previous terminal process:', error)
      }
    }
    ownedProcessesRef.current = []

    // a later attach supersedes this one — skip its state/status updates
    const isCurrent = () => attachedTerminalRef.current === xterm

    const { container } = await wcRuntime.runPromise(WebContainerService)

    if (!isCurrent()) return

    xterm.writeln('\x1b[1;34m[moatorres.co] Terminal\x1b[0m\n')

    try {
      const shellProcess = await container.spawn('jsh', {
        cwd: activeDirRef.current ?? undefined,
        terminal: {
          cols: xterm.cols,
          rows: xterm.rows,
        },
        env: {
          PATH: WEBCONTAINER_BIN_PATH,
          NODE_NO_WARNINGS: '1',
        },
      })

      if (!isCurrent()) {
        shellProcess.kill()
        return
      }

      ownedProcessesRef.current.push(shellProcess)

      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            if (isCurrent()) xterm.write(data)
          },
        })
      )

      const input = shellProcess.input.getWriter()
      shellWriterRef.current = input
      setIsShellReady(true)

      // if the shell dies, Run must go back to waiting for a new one
      shellProcess.exit.then(() => {
        if (shellWriterRef.current === input) {
          shellWriterRef.current = null
          setIsShellReady(false)
        }
      })

      xterm.onData((data) => {
        input.write(data)
      })
    } catch (error) {
      xterm.writeln('\x1b[1;31mError initializing terminal\x1b[0m')
      console.error('Terminal error:', error)
      useStatusBar
        .getState()
        .publish({ id: 'terminal', label: 'Terminal failed', tone: 'error' })
    }
  }, [])

  const prepareProject = useCallback(async (project: Project) => {
    // a newer prepare (fast project switching) supersedes this one
    const seq = ++prepareSeqRef.current
    const isCurrent = () => prepareSeqRef.current === seq

    activeDirRef.current = project.id
    // point the interactive shell at the new workspace
    shellWriterRef.current?.write(`cd /${project.id}\n`)

    // prepare lives in the workspace manifest, parsed by the store on select
    const command =
      useProjectStore.getState().playgroundConfig?.prepare ?? 'pnpm install'

    setIsInstalling(true)
    isInstallingRef.current = true
    useStatusBar.getState().publish({
      id: 'deps',
      label: 'Installing dependencies...',
      tone: 'info',
      busy: true,
    })

    try {
      const exitCode = await wcRuntime.runPromise(
        Effect.flatMap(WebContainerService, (svc) =>
          svc.run(command, {
            cwd: project.id,
            onOutput: (chunk) => attachedTerminalRef.current?.write(chunk),
          })
        )
      )

      if (!isCurrent()) return

      if (exitCode === 0) {
        attachedTerminalRef.current?.writeln(
          '\n\x1b[1;32m✓ Workspace ready\x1b[0m'
        )
        useStatusBar
          .getState()
          .publish(
            { id: 'deps', label: 'Dependencies installed', tone: 'success' },
            { ttl: 4000 }
          )
      } else {
        attachedTerminalRef.current?.writeln(
          '\n\x1b[1;31m✗ Prepare command failed\x1b[0m'
        )
        useStatusBar
          .getState()
          .publish({ id: 'deps', label: 'Installation failed', tone: 'error' })
      }
    } catch (error) {
      console.error('Prepare error:', error)
      if (isCurrent()) {
        useStatusBar
          .getState()
          .publish({ id: 'deps', label: 'Installation failed', tone: 'error' })
      }
    } finally {
      if (isCurrent()) {
        setIsInstalling(false)
        isInstallingRef.current = false
      }
    }
  }, [])

  const runCommand = useCallback(async (command: string) => {
    if (!shellWriterRef.current) {
      throw new Error('Terminal shell not initialized')
    }

    shellWriterRef.current.write(`${command}\n`)
  }, [])

  const stopCommand = useCallback(async () => {
    // ETX — the terminal-level interrupt, same as typing Ctrl+C in the
    // shell; jsh's line discipline delivers SIGINT to the foreground group
    shellWriterRef.current?.write('\x03')
    setPreviewUrl(null)

    // hold Run until the port-close event confirms the server died; capped
    // in case the event never arrives
    if (serverPortRef.current !== null) {
      stoppingRef.current = true
      setIsStopping(true)
      stopCapTimerRef.current = setTimeout(finishStopping, 8000)
    }
  }, [setPreviewUrl, finishStopping])

  const writeFile = useCallback(async (path: string, content: string) => {
    try {
      await withService((svc) => svc.writeFile(path, content))
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }, [])

  const createFile = useCallback(async (path: string) => {
    try {
      await withService((svc) =>
        Effect.gen(function* () {
          const parts = path.split('/')
          if (parts.length > 1) {
            const dirPath = parts.slice(0, -1).join('/')
            yield* svc.mkdir(dirPath, { recursive: true })
          }
          yield* svc.writeFile(path, '')
        })
      )

      toast('File Created', {
        description: (
          <div>
            Created{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded">
              {truncateFromStart(path, 18)}
            </code>{' '}
            file.
          </div>
        ),
        icon: <File className="w-3.5 h-3.5" />,
      })
    } catch (error) {
      console.error('Error creating file:', error)
      toast.error('Error', { description: 'Failed to create file' })
      throw error
    }
  }, [])

  const createFolder = useCallback(async (path: string) => {
    try {
      await withService((svc) => svc.mkdir(path, { recursive: true }))

      toast('Folder Created', {
        description: (
          <div>
            Created{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded">
              {truncateFromStart(path, 18)}
            </code>{' '}
            folder.
          </div>
        ),
        icon: <Folder className="w-3.5 h-3.5" />,
      })
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Error', { description: 'Failed to create folder' })
      throw error
    }
  }, [])

  const deleteItem = useCallback(async (path: string, isDirectory: boolean) => {
    try {
      await withService((svc) => svc.removeFile(path))

      toast(isDirectory ? 'Folder Deleted' : 'File Deleted', {
        description: (
          <div>
            Deleted{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded">
              {truncateFromStart(path, 18)}
            </code>
            {isDirectory ? ' directory.' : ' file.'}
          </div>
        ),
      })
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Error', {
        description: `Failed to delete ${isDirectory ? 'folder' : 'file'}`,
      })
      throw error
    }
  }, [])

  const renameItem = useCallback(
    async (oldPath: string, newPath: string, isDirectory: boolean) => {
      try {
        await withService((svc) =>
          Effect.gen(function* () {
            const newDir = newPath.split('/').slice(0, -1).join('/')
            if (newDir) {
              yield* svc.mkdir(newDir, { recursive: true })
            }
            yield* svc.renameFile(oldPath, newPath)
          })
        )

        toast(isDirectory ? 'Folder Renamed' : 'File Renamed', {
          description: `Renamed to ${newPath.split('/').pop()}`,
        })
      } catch (error) {
        console.error('Error renaming:', error)
        toast.error('Error', {
          description: `Failed to rename ${isDirectory ? 'folder' : 'file'}`,
        })
        throw error
      }
    },
    []
  )

  const moveItem = useCallback(
    async (sourcePath: string, targetPath: string, isDirectory: boolean) => {
      try {
        const fileName = sourcePath.split('/').pop()
        const newPath = targetPath ? `${targetPath}/${fileName}` : fileName!

        await withService((svc) => svc.renameFile(sourcePath, newPath))

        const destination = targetPath ? targetPath : 'root'
        toast(isDirectory ? 'Folder Moved' : 'File Moved', {
          description: `Moved to ${destination}`,
        })
      } catch (error) {
        console.error('Error moving:', error)
        toast.error('Error', {
          description: `Failed to move ${isDirectory ? 'folder' : 'file'}`,
        })
        throw error
      }
    },
    []
  )

  const setupFileWatcher = useCallback(
    (
      onChange: (data: {
        files: Record<string, string>
        directories: string[]
      }) => void
    ) => {
      const fiber = wcRuntime.runFork(
        Effect.gen(function* () {
          const svc = yield* WebContainerService
          yield* svc
            .watchFileSystem(() => isInstallingRef.current)
            .pipe(
              Stream.runForEach((snapshot) =>
                Effect.sync(() => onChange(snapshot))
              )
            )
        })
      )

      return () => {
        wcRuntime.runFork(Fiber.interrupt(fiber))
      }
    },
    []
  )

  const value: WebContainerContextType = {
    webcontainer,
    isInstalling,
    isShellReady,
    isStopping,
    previewUrl,
    setPreviewUrl,
    attachTerminal,
    prepareProject,
    runCommand,
    stopCommand,
    writeFile,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    moveItem,
    setupFileWatcher,
  }

  return (
    <WebContainerContext.Provider value={value}>
      {children}
    </WebContainerContext.Provider>
  )
}

export function useWebContainer() {
  const context = useContext(WebContainerContext)

  if (!context) {
    throw new Error(
      'useWebContainer must be used within a WebContainerProvider'
    )
  }

  return context
}
