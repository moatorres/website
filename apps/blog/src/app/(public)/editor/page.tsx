'use client'

import type { Monaco } from '@monaco-editor/react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  useMobile,
} from '@shadcn/ui'
import type { FitAddon } from '@xterm/addon-fit'
import type { Terminal as XTerm } from '@xterm/xterm'
import { FolderDown, Loader, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { toast } from 'sonner'

import { useCurrentFile } from './atoms/current-file'
import { usePanelVisible } from './atoms/panels'
import { CodeEditor } from './components/code-editor'
import { FileTree } from './components/file-tree'
import { MobileView } from './components/mobile-view'
import { Preview } from './components/preview'
import { ProjectSelector } from './components/project-selector'
import { Toolbar } from './components/toolbar'
import { useWebContainer } from './contexts/webcontainer-context'
import { useTypeLoader } from './hooks/use-type-loader'
import { exampleProjects } from './services/projects'
import type { FileNode, Project } from './services/types'
import {
  buildFileTree,
  clearFromLocalStorage,
  copyProjectToClipboard,
  exportAsZip,
  getLanguageFromPath,
  loadFromLocalStorage,
  saveToLocalStorage,
} from './services/utils'
import { convertFilesToFileTree } from './services/webcontainer'

const Terminal = dynamic(
  () =>
    import('./components/terminal').then((mod) => ({ default: mod.Terminal })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground gap-1.5 font-medium">
        <Loader className="w-3 h-3 animate-spin" />
        <span className="text-sm">Loading terminal...</span>
      </div>
    ),
  }
)

export default function PlaygroundPage() {
  const {
    webcontainer,
    previewUrl,
    setPreviewUrl,
    isInstalling,
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
  } = useWebContainer()

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const currentFile = useCurrentFile()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  const { isPanelVisible, toggleEditor } = usePanelVisible()

  const monacoRef = useRef<Monaco>(null)
  const fileWatcherRef = useRef<(() => void) | null>(null)

  const isMobile = useMobile()

  useTypeLoader(monacoRef.current, webcontainer, isInstalling)

  const syncFilesFromWebContainer = useCallback(async () => {
    if (!webcontainer || !selectedProject) return
    try {
      const { files, directories } = await readFiles()
      setSelectedProject((prev) => {
        if (!prev) return prev
        return { ...prev, files }
      })

      const tree = buildFileTree(files, directories)
      setFileTree(tree)

      if (currentFile.path && files[currentFile.path]) {
        currentFile.setContent(files[currentFile.path])
      }
    } catch (error) {
      console.error('Error syncing files:', error)
    }
  }, [selectedProject, currentFile, webcontainer, readFiles])

  const setupFileWatching = useCallback(() => {
    if (!webcontainer) return

    fileWatcherRef.current = setupFileWatcher(
      ({ files, directories }) => {
        setSelectedProject((prev) => {
          if (!prev) return prev
          return { ...prev, files }
        })

        const tree = buildFileTree(files, directories)

        setFileTree(tree)

        currentFile.sync(files)
      },
      { ignoreIf: () => isInstalling }
    )
  }, [webcontainer, currentFile, setupFileWatcher, isInstalling])

  const handleExportZip = useCallback(async () => {
    if (!selectedProject) return

    try {
      await syncFilesFromWebContainer()

      await exportAsZip(selectedProject.files, selectedProject.name)

      toast('Exporting Project', {
        description: 'Exporting project as ZIP file',
        icon: <FolderDown className="w-3.5 h-3.5" />,
        action: {
          label: 'Dismiss',
          onClick: () => void 0,
        },
      })
    } catch (error) {
      console.error('Error exporting ZIP:', error)
      toast.error('Export Failed', {
        description: 'Failed to export project',
      })
    }
  }, [selectedProject, syncFilesFromWebContainer])

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
      console.error('Error saving:', error)
      toast.error('Save Failed', {
        description: 'Failed to save project',
      })
    }
  }, [selectedProject, syncFilesFromWebContainer])

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
      console.error('Error copying:', error)
      toast.error('Copy Failed', {
        description: 'Failed to copy files',
      })
    }
  }, [selectedProject, syncFilesFromWebContainer])

  const handleReset = useCallback(async () => {
    if (!selectedProject) return

    try {
      // Clear localStorage for this project
      clearFromLocalStorage(selectedProject.id)

      toast('Resetting Project', {
        description: 'Clearing saved changes and reloading original...',
      })

      // Find the original project from exampleProjects
      const originalProject = exampleProjects.find(
        (p) => p.id === selectedProject.id
      )

      if (originalProject) {
        // Reload the original project
        await handleProjectSelect(originalProject)

        toast('Project Reset', {
          description: 'Project has been reset to original state',
        })
      }
    } catch (error) {
      console.error('Error resetting project:', error)
      toast.error('Reset Failed', {
        description: 'Failed to reset project',
      })
    }
  }, [selectedProject])

  const handleProjectSelect = async (project: Project) => {
    setIsLoading(true)
    setError(null)
    setPreviewUrl(null)

    if (fileWatcherRef.current) {
      fileWatcherRef.current()
      fileWatcherRef.current = null
    }

    try {
      const savedFiles = loadFromLocalStorage(project.id)
      const projectToLoad = savedFiles
        ? { ...project, files: savedFiles }
        : project

      if (savedFiles) {
        toast('Loaded Saved Version', {
          description: 'Restored your previous changes',
          dismissible: true,
        })
      }

      setSelectedProject(projectToLoad)

      const container = await initializeWebContainer()

      const tree = buildFileTree(projectToLoad.files)
      setFileTree(tree)

      const fileTreeStructure = convertFilesToFileTree(projectToLoad.files)

      if (!container) {
        throw new Error('WebContainer failed to initialize')
      }

      await container.mount(fileTreeStructure)

      currentFile.setCurrentFile({
        path: projectToLoad.initialFile,
        content: projectToLoad.files[projectToLoad.initialFile],
      })
    } catch (error) {
      console.error('Error loading project:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      setError(`Error loading project: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (path: string) => {
    currentFile.setPath(path)
    if (selectedProject) {
      currentFile.setContent(selectedProject.files?.[path] ?? '')
    }
    if (!isPanelVisible('editor')) {
      toggleEditor()
    }
  }

  const handleFileChange = async (newContent: string) => {
    currentFile.setContent(newContent)

    if (currentFile.path && webcontainer) {
      try {
        await writeFile(currentFile.path, newContent)

        if (selectedProject) {
          setSelectedProject({
            ...selectedProject,
            files: { ...selectedProject.files, [currentFile.path]: newContent },
          })
        }
      } catch (error) {
        console.error('Error writing file:', error)
      }
    }
  }

  const handleTerminalReady = useCallback(
    async (xterm: XTerm, fitAddon: FitAddon) => {
      setupFileWatching()
      await initializeTerminal(xterm, fitAddon)
    },
    [initializeTerminal, setupFileWatching]
  )

  const handleCreateFile = useCallback(
    async (path: string) => {
      await createFile(path)
      currentFile.setCurrentFile({ path, content: '' })
    },
    [createFile, currentFile]
  )

  const handleCreateFolder = useCallback(
    async (path: string) => {
      await createFolder(path)
    },
    [createFolder]
  )

  const handleDelete = useCallback(
    async (path: string, isDirectory: boolean) => {
      await deleteItem(path, isDirectory)

      if (
        currentFile.path === path ||
        currentFile.path?.startsWith(path + '/')
      ) {
        currentFile.clear()
      }
    },
    [deleteItem, currentFile]
  )

  const handleRename = useCallback(
    async (oldPath: string, newPath: string, isDirectory: boolean) => {
      await renameItem(oldPath, newPath, isDirectory)

      if (currentFile.path === oldPath) {
        currentFile.setPath(newPath)
      }
    },
    [renameItem, currentFile]
  )

  const handleMove = useCallback(
    async (sourcePath: string, targetPath: string, isDirectory: boolean) => {
      await moveItem(sourcePath, targetPath, isDirectory)

      const fileName = sourcePath.split('/').pop()
      const newPath = targetPath ? `${targetPath}/${fileName}` : fileName!

      if (currentFile.path === sourcePath) {
        currentFile.setPath(newPath)
      }
    },
    [moveItem, currentFile]
  )

  const handleRunCommand = useCallback(async () => {
    if (isRunning) return

    setIsRunning(true)

    try {
      await runCommand('npm run dev')

      toast('Starting Server', {
        description: 'Running npm run dev...',
      })

      setTimeout(() => {
        setIsRunning(false)
      }, 3000)
    } catch (error) {
      console.error('Error running command:', error)
      toast.error('Run Failed', {
        description: 'Failed to start dev server',
      })
      setIsRunning(false)
    }
  }, [isRunning, runCommand])

  const handleOpenProjectSelector = useCallback(() => {
    setShowProjectSelector(true)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showProjectSelector) {
        setShowProjectSelector(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showProjectSelector])

  useEffect(() => {
    return () => {
      if (fileWatcherRef.current) {
        fileWatcherRef.current()
      }
    }
  }, [])

  if (isMobile) {
    return (
      <MobileView
        projectName={selectedProject?.name}
        onBack={selectedProject ? () => setSelectedProject(null) : undefined}
      />
    )
  }

  if (!selectedProject) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 backdrop-blur-xl bg-background/80" />
        <div className="relative z-10 w-full max-w-2xl mx-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            <ProjectSelector
              projects={exampleProjects}
              onSelectProject={handleProjectSelect}
            />
          </div>
        </div>
      </div>
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
    <div
      className={`transition-all duration-300 ease-in-out ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'min-h-screen flex flex-col p-6'}`}
    >
      <div
        className={`
        mx-auto w-full flex flex-col relative
        ${isFullscreen ? 'h-full' : 'h-[calc(100vh-3rem)] rounded-xl shadow-2xl'}
        ${isFullscreen ? '' : 'border border-border/50'}
        bg-background overflow-hidden
      `}
      >
        <Toolbar
          onExportZip={handleExportZip}
          onSave={handleSave}
          onReset={handleReset}
          onCopy={handleCopy}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onRunCommand={handleRunCommand}
          isRunning={isRunning}
          onOpenProjectSelector={handleOpenProjectSelector}
        />

        {isLoading && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 transition-all">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                Loading project...
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Setting up your workspace
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 transition-all">
            <div className="text-center max-w-md">
              <div className="text-destructive text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">
                Failed to Load Project
              </h2>
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
        )}

        <PanelGroup
          direction="vertical"
          className="flex-1"
          id="main-panel-group"
        >
          <Panel defaultSize={70} minSize={30} id="top-panel">
            <PanelGroup direction="horizontal" id="horizontal-panel-group">
              <Panel
                defaultSize={20}
                minSize={10}
                maxSize={30}
                id="explorer-panel"
                className={isPanelVisible('explorer') ? '' : 'hidden'}
              >
                <div className="h-full border-r border-border overflow-y-auto bg-background/50 flex flex-col">
                  <div className="h-10 p-3 border-b border-border/50 flex items-center shrink-0">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Explorer
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <FileTree
                      nodes={fileTree}
                      onFileSelect={handleFileSelect}
                      selectedFile={currentFile.path}
                      onCreateFile={handleCreateFile}
                      onCreateFolder={handleCreateFolder}
                      onDelete={handleDelete}
                      onRename={handleRename}
                      onMove={handleMove}
                    />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle
                className={`w-0.5 bg-border/50 hover:bg-primary/50 transition-colors ${isPanelVisible('explorer') ? '' : 'hidden'}`}
              />

              <Panel defaultSize={80} id="editor-preview-panel">
                <PanelGroup direction="horizontal" id="editor-preview-group">
                  <Panel
                    defaultSize={isPanelVisible('preview') ? 60 : 100}
                    minSize={30}
                    id="editor-panel"
                    className={isPanelVisible('editor') ? '' : 'hidden'}
                  >
                    <div className="h-full flex flex-col">
                      {currentFile.path ? (
                        <>
                          <div className="h-10 border-b border-border/50 flex items-center px-4 shrink-0">
                            <Breadcrumb>
                              <BreadcrumbList>
                                {currentFile.path
                                  .split('/')
                                  .map((segment, index, arr) => {
                                    const isLast = index === arr.length - 1
                                    const path = arr
                                      .slice(0, index + 1)
                                      .join('/')

                                    return (
                                      <BreadcrumbItem key={path}>
                                        {isLast ? (
                                          <BreadcrumbPage className="text-sm font-medium">
                                            {segment}
                                          </BreadcrumbPage>
                                        ) : (
                                          <>
                                            <BreadcrumbLink className="text-sm cursor-pointer hover:text-foreground transition-colors">
                                              {segment}
                                            </BreadcrumbLink>
                                            <BreadcrumbSeparator />
                                          </>
                                        )}
                                      </BreadcrumbItem>
                                    )
                                  })}
                              </BreadcrumbList>
                            </Breadcrumb>
                          </div>
                          <div className="flex-1">
                            <CodeEditor
                              value={currentFile.content}
                              onChange={handleFileChange}
                              language={getLanguageFromPath(currentFile.path)}
                              filePath={currentFile.path}
                              files={selectedProject?.files}
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

                  <PanelResizeHandle
                    className={`w-0.5 bg-border/50 hover:bg-primary/50 transition-colors ${isPanelVisible('editor') && isPanelVisible('preview') ? '' : 'hidden'}`}
                  />

                  <Panel
                    defaultSize={40}
                    minSize={20}
                    id="preview-panel"
                    className={`px-0 ${isPanelVisible('preview') ? '' : 'hidden'}`}
                  >
                    <div className="h-full flex flex-col overflow-hidden bg-background/50 border-l border-border/50">
                      <div className="h-10 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Preview
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <Preview url={previewUrl} isLoading={false} />
                      </div>
                    </div>
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle
            className={`h-0.5 bg-border/50 hover:bg-primary/50 transition-colors ${isPanelVisible('terminal') ? '' : 'hidden'}`}
          />

          <Panel
            id="terminal-panel"
            defaultSize={30}
            minSize={15}
            maxSize={50}
            className={isPanelVisible('terminal') ? '' : 'hidden'}
          >
            <div className="h-full border-t border-border/50 bg-background flex flex-col">
              <div className="h-10 border-b border-border/50 flex items-center px-4 shrink-0">
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
              <div className="flex-1 overflow-hidden">
                <Terminal onReady={handleTerminalReady} />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {showProjectSelector && (
        <div className="fixed inset-0 z-200 flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-xs bg-background/80"
            onClick={() => setShowProjectSelector(false)}
          />

          <div className="relative z-10 w-full max-w-2xl mx-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
              <ProjectSelector
                projects={exampleProjects}
                onSelectProject={(project) => {
                  handleProjectSelect(project)
                  setShowProjectSelector(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
