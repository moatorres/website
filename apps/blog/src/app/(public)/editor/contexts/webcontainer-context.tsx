'use client'

import { useMonaco } from '@monaco-editor/react'
import type { WebContainer } from '@webcontainer/api'
import type { FitAddon } from '@xterm/addon-fit'
import type { Terminal as XTerm } from '@xterm/xterm'
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

import {
  clearFileSystem,
  getWebContainerInstance,
  readAllFiles,
  watchFileSystem,
} from '../services/webcontainer'

interface WebContainerContextType {
  // WebContainer instance and refs
  webcontainer: WebContainer | null
  terminal: XTerm | null
  shellWriter: WritableStreamDefaultWriter | null

  // State
  isInstalling: boolean
  previewUrl: string | null
  setPreviewUrl: (url: string | null) => void

  // Methods
  initializeWebContainer: () => Promise<WebContainer>
  initializeTerminal: (
    xterm: XTerm,
    fitAddon: FitAddon,
    onReady?: () => void
  ) => Promise<void>
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
  readFiles: () => Promise<{
    files: Record<string, string>
    directories: string[]
  }>
  setupFileWatcher: (
    onChange: (data: {
      files: Record<string, string>
      directories: string[]
    }) => void,
    options?: { ignoreIf?: () => boolean }
  ) => () => void
  runCommand: (command: string) => Promise<void>
  clearContainer: () => Promise<void>
}

const WebContainerContext = createContext<WebContainerContextType | null>(null)

const WEBCONTAINER_BIN_PATH = 'node_modules/.bin:/usr/local/bin:/usr/bin:/bin'

export function WebContainerProvider({ children }: { children: ReactNode }) {
  const webcontainerRef = useRef<WebContainer | null>(null)
  const terminalRef = useRef<XTerm | null>(null)
  const shellWriterRef = useRef<WritableStreamDefaultWriter | null>(null)
  const terminalReadyRef = useRef(false)
  const isInstallingRef = useRef(false)
  const monaco = useMonaco()

  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [previewUrl, setPreviewUrlState] = useState<string | null>(null)

  const setPreviewUrl = useCallback((url: string | null) => {
    setPreviewUrlState(url)
  }, [])

  // Initialize WebContainer
  const initializeWebContainer =
    useCallback(async (): Promise<WebContainer> => {
      try {
        const instance = await getWebContainerInstance()

        webcontainerRef.current = instance

        setWebcontainer(instance)

        // Listen for server-ready events
        instance.on('server-ready', (port, url) => {
          setPreviewUrl(url)
          toast('Server Ready', {
            description: `Preview available on port ${port}`,
            duration: 3000,
          })
        })

        // Clear file system
        await clearFileSystem(instance)

        return instance
      } catch (error) {
        console.error('WebContainer initialization error:', error)
        throw error
      }
    }, [setPreviewUrl])

  const initializeTerminal = useCallback(
    async (xterm: XTerm, fitAddon: FitAddon, onReady?: () => void) => {
      if (terminalReadyRef.current && terminalRef.current === xterm) {
        return
      }

      terminalReadyRef.current = true
      terminalRef.current = xterm

      if (!webcontainerRef.current) return

      xterm.writeln('\x1b[1;34m[moatorres.co] Terminal\x1b[0m\n')
      xterm.writeln('Initializing...\n')

      setIsInstalling(true)

      try {
        const installProcess = await webcontainerRef.current.spawn('pnpm', [
          'install',
        ])

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              xterm.write(data)
            },
          })
        )

        const exitCode = await installProcess.exit

        if (exitCode === 0) {
          xterm.writeln(
            '\n\x1b[1;32m✓ Dependencies installed successfully\x1b[0m\n'
          )
          toast('Initialized', {
            description: 'Dependencies installed successfully',
          })
        } else {
          xterm.writeln('\n\x1b[1;31m✗ Installation failed\x1b[0m\n')
        }

        // Start shell
        const shellProcess = await webcontainerRef.current.spawn('jsh', {
          terminal: {
            cols: xterm.cols,
            rows: xterm.rows,
          },
          env: {
            PATH: WEBCONTAINER_BIN_PATH,
            NODE_NO_WARNINGS: '1',
          },
        })

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              xterm.write(data)
            },
          })
        )

        const input = shellProcess.input.getWriter()
        shellWriterRef.current = input

        xterm.onData((data) => {
          input.write(data)
        })
      } catch (error) {
        xterm.writeln('\x1b[1;31mError initializing terminal\x1b[0m')
        console.error('Terminal error:', error)
      } finally {
        setIsInstalling(false)

        // Callback when ready
        onReady?.()
      }
    },
    [monaco]
  )

  // File operations
  const writeFile = useCallback(async (path: string, content: string) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized')
    }

    try {
      await webcontainerRef.current.fs.writeFile(path, content)
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }, [])

  const createFile = useCallback(async (path: string) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized')
    }

    try {
      const parts = path.split('/')

      if (parts.length > 1) {
        const dirPath = parts.slice(0, -1).join('/')
        await webcontainerRef.current.fs.mkdir(dirPath, { recursive: true })
      }

      await webcontainerRef.current.fs.writeFile(path, '')

      toast('File Created', {
        description: `Created ${path}`,
      })
    } catch (error) {
      console.error('Error creating file:', error)
      toast.error('Error', {
        description: 'Failed to create file',
      })
      throw error
    }
  }, [])

  const createFolder = useCallback(async (path: string) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized')
    }

    try {
      await webcontainerRef.current.fs.mkdir(path, { recursive: true })

      toast('Folder Created', {
        description: `Created ${path}`,
      })
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Error', {
        description: 'Failed to create folder',
      })
      throw error
    }
  }, [])

  const deleteItem = useCallback(async (path: string, isDirectory: boolean) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized')
    }

    try {
      if (isDirectory) {
        await webcontainerRef.current.fs.rm(path, {
          recursive: true,
          force: true,
        })
      } else {
        await webcontainerRef.current.fs.rm(path)
      }

      toast(isDirectory ? 'Folder Deleted' : 'File Deleted', {
        description: `Deleted ${path}`,
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
      if (!webcontainerRef.current) {
        throw new Error('WebContainer not initialized')
      }

      try {
        if (isDirectory) {
          const files = await readAllFiles(webcontainerRef.current)
          const filesToMove = Object.keys(files.files).filter((f) =>
            f.startsWith(oldPath + '/')
          )

          await webcontainerRef.current.fs.mkdir(newPath, { recursive: true })

          for (const file of filesToMove) {
            const newFilePath = file.replace(oldPath, newPath)
            const content = await webcontainerRef.current.fs.readFile(
              file,
              'utf-8'
            )
            await webcontainerRef.current.fs.writeFile(newFilePath, content)
          }

          await webcontainerRef.current.fs.rm(oldPath, {
            recursive: true,
            force: true,
          })
        } else {
          const content = await webcontainerRef.current.fs.readFile(
            oldPath,
            'utf-8'
          )
          const newDir = newPath.split('/').slice(0, -1).join('/')
          if (newDir) {
            await webcontainerRef.current.fs.mkdir(newDir, { recursive: true })
          }
          await webcontainerRef.current.fs.writeFile(newPath, content)
          await webcontainerRef.current.fs.rm(oldPath)
        }

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
      if (!webcontainerRef.current) {
        throw new Error('WebContainer not initialized')
      }

      try {
        const fileName = sourcePath.split('/').pop()
        const newPath = targetPath ? `${targetPath}/${fileName}` : fileName!

        if (isDirectory) {
          const files = await readAllFiles(webcontainerRef.current)
          const filesToMove = Object.keys(files.files).filter((f) =>
            f.startsWith(sourcePath + '/')
          )

          await webcontainerRef.current.fs.mkdir(newPath, { recursive: true })

          for (const file of filesToMove) {
            const relPath = file.substring(sourcePath.length + 1)
            const newFilePath = `${newPath}/${relPath}`
            const content = await webcontainerRef.current.fs.readFile(
              file,
              'utf-8'
            )
            const newFileDir = newFilePath.split('/').slice(0, -1).join('/')
            if (newFileDir) {
              await webcontainerRef.current.fs.mkdir(newFileDir, {
                recursive: true,
              })
            }
            await webcontainerRef.current.fs.writeFile(newFilePath, content)
          }

          await webcontainerRef.current.fs.rm(sourcePath, {
            recursive: true,
            force: true,
          })
        } else {
          const content = await webcontainerRef.current.fs.readFile(
            sourcePath,
            'utf-8'
          )
          await webcontainerRef.current.fs.writeFile(newPath, content)
          await webcontainerRef.current.fs.rm(sourcePath)
        }

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

  const readFiles = useCallback(async () => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized')
    }

    return await readAllFiles(webcontainerRef.current)
  }, [])

  const setupFileWatcher = useCallback(
    (
      onChange: (data: {
        files: Record<string, string>
        directories: string[]
      }) => void,
      options?: { ignoreIf?: () => boolean }
    ) => {
      if (!webcontainerRef.current) {
        console.error('WebContainer not initialized')
        return () => {
          // noop
        }
      }

      const cleanup = watchFileSystem(
        webcontainerRef.current,
        onChange,
        options
      )

      return cleanup
    },
    []
  )

  const runCommand = useCallback(async (command: string) => {
    if (!shellWriterRef.current) {
      throw new Error('Terminal shell not initialized')
    }

    try {
      shellWriterRef.current.write(`${command}\n`)
    } catch (error) {
      console.error('Error running command:', error)
      throw error
    }
  }, [])

  const clearContainer = useCallback(async () => {
    if (!webcontainerRef.current) return

    terminalReadyRef.current = false
    terminalRef.current = null
    shellWriterRef.current = null

    await clearFileSystem(webcontainerRef.current)
  }, [])

  // Sync isInstalling ref with state
  useEffect(() => {
    isInstallingRef.current = isInstalling
  }, [isInstalling])

  const value: WebContainerContextType = {
    webcontainer,
    terminal: terminalRef.current,
    shellWriter: shellWriterRef.current,
    isInstalling,
    previewUrl,
    setPreviewUrl,
    initializeWebContainer,
    initializeTerminal,
    writeFile,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    moveItem,
    readFiles,
    setupFileWatcher,
    runCommand,
    clearContainer,
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
