'use client'

import { Monaco } from '@monaco-editor/react'
import { Button } from '@shadcn/ui'
import type { WebContainer } from '@webcontainer/api'
import type { FitAddon } from '@xterm/addon-fit'
import type { Terminal as XTerm } from '@xterm/xterm'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { toast } from 'sonner'

import { CodeEditor } from './code-editor'
import {
  copyProjectToClipboard,
  exportAsZip,
  loadFromLocalStorage,
  saveToLocalStorage,
} from './export-utils'
import { FileTree } from './file-tree'
import { Preview } from './preview'
import { ProjectSelector } from './project-selector'
import { exampleProjects } from './projects'
import { Toolbar } from './toolbar'
import type { FileNode, Project } from './types'
import { useDebounce } from './use-debounce'
import {
  clearFileSystem,
  convertFilesToFileTree,
  getWebContainerInstance,
  readAllFiles,
  watchFileSystem,
} from './webcontainer'

const Terminal = dynamic(
  () => import('./terminal').then((mod) => ({ default: mod.Terminal })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        <span className="text-sm">Loading terminal...</span>
      </div>
    ),
  }
)

export default function PlaygroundPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [crossOriginIsolated, setCrossOriginIsolated] = useState<
    boolean | null
  >(null)
  const [isMounted, setIsMounted] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [isServerStarting, setIsServerStarting] = useState(false)
  const debouncedLoadTypes = useDebounce(loadTypeDefinitions, 500)

  const webcontainerRef = useRef<WebContainer | null>(null)
  const terminalRef = useRef<XTerm | null>(null)
  const shellWriterRef = useRef<WritableStreamDefaultWriter | null>(null)
  const terminalReadyRef = useRef(false)
  const fileWatcherRef = useRef<(() => void) | null>(null)
  const monacoRef = useRef<any>(null)

  const WEBCONTAINER_BIN_PATH = 'node_modules/.bin:/usr/local/bin:/usr/bin:/bin'

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      html: 'html',
      css: 'css',
      md: 'markdown',
    }
    return languageMap[ext || ''] || 'plaintext'
  }

  const buildFileTree = (
    files: Record<string, string>,
    directories: string[] = []
  ): FileNode[] => {
    const tree: FileNode[] = []
    const pathMap = new Map<string, FileNode>()

    for (const dirPath of directories) {
      const parts = dirPath.split('/')
      let currentPath = ''

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const parentPath = currentPath
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (!pathMap.has(currentPath)) {
          const node: FileNode = {
            name: part,
            type: 'directory',
            path: currentPath,
            children: [],
          }

          pathMap.set(currentPath, node)

          if (parentPath) {
            const parent = pathMap.get(parentPath)
            if (parent && parent.children) {
              parent.children.push(node)
            }
          } else {
            tree.push(node)
          }
        }
      }
    }

    const sortedPaths = Object.keys(files).sort()

    for (const path of sortedPaths) {
      const parts = path.split('/')
      let currentPath = ''

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const parentPath = currentPath
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (!pathMap.has(currentPath)) {
          const isFile = i === parts.length - 1
          const node: FileNode = {
            name: part,
            type: isFile ? 'file' : 'directory',
            path: currentPath,
            children: isFile ? undefined : [],
            content: isFile ? files[path] : undefined,
          }

          pathMap.set(currentPath, node)

          if (parentPath) {
            const parent = pathMap.get(parentPath)
            if (parent && parent.children) {
              parent.children.push(node)
            }
          } else {
            tree.push(node)
          }
        }
      }
    }

    const sortNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .sort((a, b) => {
          if (a.type === 'directory' && b.type === 'file') return -1
          if (a.type === 'file' && b.type === 'directory') return 1
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        })
        .map((node) => {
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: sortNodes(node.children),
            }
          }
          return node
        })
    }

    return sortNodes(tree)
  }

  const syncFilesFromWebContainer = useCallback(async () => {
    if (!webcontainerRef.current || !selectedProject) return

    try {
      const { files, directories } = await readAllFiles(webcontainerRef.current)
      console.log(
        '[v0] Synced files from WebContainer:',
        Object.keys(files).length,
        'files,',
        directories.length,
        'directories'
      )

      setSelectedProject({
        ...selectedProject,
        files,
      })

      const tree = buildFileTree(files, directories)
      setFileTree(tree)

      if (selectedFile && files[selectedFile]) {
        setFileContent(files[selectedFile])
      }
    } catch (error) {
      console.error('[v0] Error syncing files:', error)
    }
  }, [selectedProject, selectedFile])

  const setupFileWatching = useCallback(() => {
    if (!webcontainerRef.current) return

    if (fileWatcherRef.current) {
      console.log('[v0] Cleaning up existing file watchers')
      fileWatcherRef.current()
      fileWatcherRef.current = null
    }

    console.log('[v0] Setting up file system watcher')

    fileWatcherRef.current = watchFileSystem(
      webcontainerRef.current,
      ({ files, directories }) => {
        console.log(
          `[v0] File system updated, syncing ${Object.keys(files).length} files and ${directories.length} directories to UI`
        )

        // Update project state with new files
        setSelectedProject((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            files,
          }
        })

        // Rebuild file tree
        const tree = buildFileTree(files, directories)
        setFileTree(tree)

        // Update current file content if it changed
        setSelectedFile((currentFile) => {
          if (currentFile && files[currentFile]) {
            setFileContent(files[currentFile])
          }
          return currentFile
        })

        toast('Files Updated', {
          description: 'File system changes detected',
          duration: 2000,
        })
      }
    )

    console.log('[v0] File system watcher setup complete')
  }, [toast])

  const handleExportZip = useCallback(async () => {
    if (!selectedProject) return

    try {
      await syncFilesFromWebContainer()

      await exportAsZip(selectedProject.files, selectedProject.name)

      toast('Export Successful', {
        description: 'Project exported as ZIP file',
      })
    } catch (error) {
      console.error('[v0] Error exporting ZIP:', error)
      toast.error('Export Failed', {
        description: 'Failed to export project',
      })
    }
  }, [selectedProject, syncFilesFromWebContainer, toast])

  const handleSave = useCallback(async () => {
    if (!selectedProject) return

    try {
      await syncFilesFromWebContainer()

      const success = saveToLocalStorage(
        selectedProject.id,
        selectedProject.files
      )

      if (success) {
        toast('Saved', {
          description: 'Project saved to browser storage',
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('[v0] Error saving:', error)
      toast.error('Save Failed', {
        description: 'Failed to save project',
      })
    }
  }, [selectedProject, syncFilesFromWebContainer, toast])

  const handleCopy = useCallback(async () => {
    if (!selectedProject) return

    try {
      await syncFilesFromWebContainer()

      const success = await copyProjectToClipboard(selectedProject.files)

      if (success) {
        toast('Copied', {
          description: 'All files copied to clipboard',
        })
      } else {
        throw new Error('Failed to copy')
      }
    } catch (error) {
      console.error('[v0] Error copying:', error)
      toast.error('Copy Failed', {
        description: 'Failed to copy files',
      })
    }
  }, [selectedProject, syncFilesFromWebContainer, toast])

  const handleProjectSelect = async (project: Project) => {
    setIsLoading(true)
    setError(null)
    terminalReadyRef.current = false
    setPreviewUrl(null)
    setIsServerStarting(false)

    if (fileWatcherRef.current) {
      fileWatcherRef.current()
      fileWatcherRef.current = null
    }

    try {
      console.log('[v0] Loading project:', project.name)

      const savedFiles = loadFromLocalStorage(project.id)
      const projectToLoad = savedFiles
        ? { ...project, files: savedFiles }
        : project

      if (savedFiles) {
        toast('Loaded Saved Version', {
          description: 'Restored your previous changes',
        })
      }

      setSelectedProject(projectToLoad)

      const webcontainer = await getWebContainerInstance()
      console.log('[v0] WebContainer instance obtained')

      webcontainerRef.current = webcontainer

      webcontainer.on('server-ready', (port, url) => {
        console.log('[v0] Server ready on port', port, 'at', url)
        setPreviewUrl(url)
        setIsServerStarting(false)
        toast('Server Ready', {
          description: `Preview available on port ${port}`,
          duration: 3000,
        })
      })

      console.log('[v0] Clearing file system...')
      await clearFileSystem(webcontainer)

      const tree = buildFileTree(projectToLoad.files)
      setFileTree(tree)

      console.log('[v0] Mounting file tree...')
      const fileTreeStructure = convertFilesToFileTree(projectToLoad.files)
      await webcontainer.mount(fileTreeStructure)
      console.log('[v0] File tree mounted successfully')

      const firstFile = Object.keys(projectToLoad.files)[0]
      setSelectedFile(firstFile)
      setFileContent(projectToLoad.files[firstFile])
    } catch (error) {
      console.error('[v0] Error loading project:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      setError(`Error loading project: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (path: string) => {
    setSelectedFile(path)
    if (selectedProject) {
      setFileContent(selectedProject.files[path] || '')
    }
  }

  const handleFileChange = async (newContent: string) => {
    setFileContent(newContent)

    if (selectedFile && webcontainerRef.current) {
      try {
        await webcontainerRef.current.fs.writeFile(selectedFile, newContent)

        if (selectedProject) {
          setSelectedProject({
            ...selectedProject,
            files: {
              ...selectedProject.files,
              [selectedFile]: newContent,
            },
          })
        }
      } catch (error) {
        console.error('Error writing file:', error)
      }
    }
  }

  const handleTerminalReady = useCallback(
    async (xterm: XTerm, fitAddon: FitAddon) => {
      if (terminalReadyRef.current) {
        console.log('[v0] Terminal already initialized, skipping')
        return
      }

      terminalReadyRef.current = true
      terminalRef.current = xterm

      if (!webcontainerRef.current) {
        console.log('[v0] WebContainer not ready yet')
        return
      }

      console.log('[v0] Initializing terminal...')
      xterm.writeln('\x1b[1;34mWebContainer Terminal\x1b[0m')
      xterm.writeln('Initializing...\n')

      setIsInstalling(true)

      try {
        console.log('[v0] Starting pnpm install...')
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
        console.log('[v0] pnpm install exit code:', exitCode)

        if (exitCode === 0) {
          xterm.writeln(
            '\n\x1b[1;32m✓ Dependencies installed successfully\x1b[0m\n'
          )

          console.log('[v0] Loading type definitions...')
          if (webcontainerRef.current && monacoRef.current) {
            await loadTypeDefinitions(
              monacoRef.current,
              webcontainerRef.current
            )
            console.log('[v0] Type definitions loaded.')
          } else {
            console.warn(
              '[v0] Monaco or WebContainer not ready for type loading'
            )
          }

          toast('Initialized', {
            description: 'Dependencies installed successfully',
          })

          console.log('[v0] Setting up file watching after install')
          setupFileWatching()
        } else {
          xterm.writeln('\n\x1b[1;31m✗ Installation failed\x1b[0m\n')
        }

        console.log('[v0] Starting shell...')
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

        console.log('[v0] Terminal ready')
      } catch (error) {
        console.error('[v0] Terminal error:', error)
        xterm.writeln('\x1b[1;31mError initializing terminal\x1b[0m')
      } finally {
        setIsInstalling(false)
      }
    },
    [setupFileWatching, toast]
  )

  const handleCreateFile = useCallback(
    async (path: string) => {
      if (!webcontainerRef.current) return

      try {
        // Create parent directories if they don't exist
        const parts = path.split('/')
        if (parts.length > 1) {
          const dirPath = parts.slice(0, -1).join('/')
          await webcontainerRef.current.fs.mkdir(dirPath, { recursive: true })
        }

        // Create the file with empty content
        await webcontainerRef.current.fs.writeFile(path, '')

        toast('File Created', {
          description: `Created ${path}`,
        })

        // Select the newly created file
        setSelectedFile(path)
        setFileContent('')
      } catch (error) {
        console.error('[v0] Error creating file:', error)
        toast.error('Error', {
          description: 'Failed to create file',
        })
      }
    },
    [toast]
  )

  const handleCreateFolder = useCallback(
    async (path: string) => {
      if (!webcontainerRef.current) return

      try {
        await webcontainerRef.current.fs.mkdir(path, { recursive: true })

        toast('Folder Created', {
          description: `Created ${path}`,
        })
      } catch (error) {
        console.error('[v0] Error creating folder:', error)
        toast.error('Error', {
          description: 'Failed to create folder',
        })
      }
    },
    [toast]
  )

  const handleDelete = useCallback(
    async (path: string, isDirectory: boolean) => {
      if (!webcontainerRef.current) return

      try {
        if (isDirectory) {
          await webcontainerRef.current.fs.rm(path, {
            recursive: true,
            force: true,
          })
        } else {
          await webcontainerRef.current.fs.rm(path)
        }

        // If the deleted file was selected, clear selection
        if (selectedFile === path || selectedFile?.startsWith(path + '/')) {
          setSelectedFile(null)
          setFileContent('')
        }

        toast(isDirectory ? 'Folder Deleted' : 'File Deleted', {
          description: `Deleted ${path}`,
        })
      } catch (error) {
        console.error('[v0] Error deleting:', error)
        toast.error('Error', {
          description: `Failed to delete ${isDirectory ? 'folder' : 'file'}`,
        })
      }
    },
    [selectedFile, toast]
  )

  useEffect(() => {
    return () => {
      if (fileWatcherRef.current) {
        fileWatcherRef.current()
      }
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const isIsolated =
      typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated
    setCrossOriginIsolated(isIsolated)

    if (isIsolated) {
      console.log('[v0] Cross-Origin Isolation is enabled ✓')
    }
  }, [isMounted, crossOriginIsolated])

  useEffect(() => {
    if (!webcontainerRef.current) return

    const handleLockfileChange = (
      eventType: string,
      filename: string | Uint8Array<ArrayBufferLike> | null
    ) => {
      // Check for the specific lockfile change
      if (filename === 'pnpm-lock.yaml') {
        console.log(
          `[TypeWatcher] Lockfile changed (${eventType}). Debouncing type reload...`
        )
        // Trigger the debounced type reload function
        debouncedLoadTypes(monacoRef.current, webcontainerRef.current!)
      }
    }

    // Watch for changes to the lockfile to indicate new dependencies are installed
    const watcher = webcontainerRef.current.fs.watch(
      '/pnpm-lock.yaml',
      {},
      handleLockfileChange
    )

    return () => {
      console.log('[TypeWatcher] Closing lockfile watcher.')
      watcher.close()
    }
  }, [webcontainerRef.current, debouncedLoadTypes])

  useEffect(() => {
    ;(async function () {
      if (monacoRef.current && webcontainerRef.current) {
        await loadTypeDefinitions(monacoRef.current, webcontainerRef.current)
      }
    })()
  }, [webcontainerRef.current, monacoRef.current])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!selectedProject) {
    return (
      <ProjectSelector
        projects={exampleProjects}
        onSelectProject={handleProjectSelect}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Failed to Load Project</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => {
              setError(null)
              setSelectedProject(null)
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="max-w-[1800px] mx-auto w-full flex flex-col h-[calc(100vh-3rem)] rounded-xl border border-border/50 bg-background shadow-2xl overflow-hidden">
        <Toolbar
          projectName={selectedProject.name}
          onExportZip={handleExportZip}
          onSave={handleSave}
          onCopy={handleCopy}
          onBack={() => setSelectedProject(null)}
        />

        <PanelGroup direction="vertical" className="flex-1">
          <Panel defaultSize={70} minSize={30}>
            <PanelGroup direction="horizontal">
              {/* File Tree Panel */}
              <Panel defaultSize={15} minSize={10} maxSize={30}>
                <div className="h-full border-r border-border overflow-y-auto bg-card/50">
                  <div className="p-3 border-b border-border/50">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Explorer
                    </h3>
                  </div>
                  <FileTree
                    nodes={fileTree}
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    onCreateFile={handleCreateFile}
                    onCreateFolder={handleCreateFolder}
                    onDelete={handleDelete}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="w-0.5 bg-border/50 hover:bg-primary/50 transition-colors" />

              {/* Editor + Preview Panel */}
              <Panel defaultSize={85}>
                <PanelGroup direction="horizontal">
                  {/* Editor Panel */}
                  <Panel defaultSize={showPreview ? 60 : 100} minSize={30}>
                    <div className="h-full flex flex-col overflow-hidden">
                      {selectedFile ? (
                        <>
                          <div className="h-10 border-b border-border/50 flex items-center px-4">
                            <span className="text-sm text-muted-foreground font-medium">
                              {selectedFile}
                            </span>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <CodeEditor
                              value={fileContent}
                              onChange={handleFileChange}
                              language={getLanguageFromPath(selectedFile)}
                              filePath={selectedFile}
                              onMonacoReady={(monaco) => {
                                monacoRef.current = monaco
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📝</div>
                            <p className="text-sm">Select a file to edit</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Panel>

                  {/* Preview Panel */}
                  {showPreview && (
                    <>
                      <PanelResizeHandle className="w-0.5 bg-border/50 hover:bg-primary/50 transition-colors" />
                      <Panel defaultSize={40} minSize={20}>
                        <div className="h-full flex flex-col overflow-hidden bg-card/50 border-l border-border/50">
                          <div className="h-10 border-b border-border/50 flex items-center justify-between px-4">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Preview
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPreview(false)}
                              className="h-7 w-7 p-0 hover:bg-muted"
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <Preview
                              url={previewUrl}
                              isLoading={isServerStarting}
                            />
                          </div>
                        </div>
                      </Panel>
                    </>
                  )}
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="h-0.5 bg-border/50 hover:bg-primary/50 transition-colors" />

          {/* Terminal Panel */}
          <Panel id="terminal-panel" defaultSize={30} minSize={15} maxSize={50}>
            <div className="h-full border-t border-border/50 bg-background">
              <div className="h-9 border-b border-border/50 flex items-center px-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Terminal
                </span>
                {isInstalling && (
                  <span className="ml-3 text-xs text-primary flex items-center gap-1.5 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Installing dependencies...
                  </span>
                )}
              </div>
              <div className="h-[calc(100%-2.25rem)] flex flex-col justify-end overflow-hidden">
                <Terminal onReady={handleTerminalReady} />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {!showPreview && (
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowPreview(true)}
          className="fixed bottom-8 right-8 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Eye className="h-4 w-4 mr-2" />
          Show Preview
        </Button>
      )}
    </div>
  )
}

// --------------------------------------------------
// Utils
// --------------------------------------------------

export async function loadTypeDefinitions(
  monaco: Monaco,
  webcontainer: WebContainer,
  basePath = '/node_modules/.pnpm'
) {
  async function readDirRecursive(dir: string): Promise<void> {
    let entries
    try {
      entries = await webcontainer.fs.readdir(dir, { withFileTypes: true })
    } catch (err) {
      console.error('[TypeLoader:readdir] Failed', dir, err)
      return
    }

    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`
      console.debug(fullPath)

      if (entry.isDirectory()) {
        await readDirRecursive(fullPath)
      } else if (
        entry.name.endsWith('.d.ts') ||
        entry.name === 'package.json'
      ) {
        try {
          const content = await webcontainer.fs.readFile(fullPath, 'utf-8')
          console.debug(
            `[TypeLoader] READ SUCCESS: ${fullPath} (Length: ${content.length})`
          )
          const normalized = fullPath.replace(
            /.*\/node_modules\//,
            '/node_modules/'
          )
          const virtualPath = `file://${normalized}`
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            content,
            virtualPath
          )
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            content,
            virtualPath
          )
        } catch (e) {
          console.error(`[TypeLoader:readFile] Failed to read ${fullPath}:`, e)
        }
      }
    }
  }

  console.log('[TypeLoader] Scanning for .d.ts files...')
  await readDirRecursive(basePath)
  console.log('[TypeLoader] Type definitions loaded into Monaco.')
}
