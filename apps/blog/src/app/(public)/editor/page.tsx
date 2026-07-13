'use client'

import type { Monaco } from '@monaco-editor/react'
import { Button, useMobile } from '@shadcn/ui'
import {
  ChevronsDown,
  ChevronsUp,
  FolderDown,
  Loader,
  Loader2,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'
import { toast } from 'sonner'

import { useCurrentFile } from './atoms/current-file'
import { useEditorTabs } from './atoms/editor-tabs'
import { usePanelVisible } from './atoms/panels'
import { useProjectStore } from './atoms/project-store.js'
import { useStatusBar } from './atoms/status'
import { CodeEditor } from './components/code-editor'
import { EditorTabs } from './components/editor-tabs'
import { FileTree } from './components/file-tree'
import { MobileView } from './components/mobile-view'
import { Preview } from './components/preview'
import { ProjectSelector } from './components/project-selector'
import { StatusBar } from './components/status-bar'
import { Toolbar } from './components/toolbar'
import { useWebContainer } from './contexts/webcontainer'
import { useTypeLoader } from './hooks/use-type-loader'
import { exampleProjects } from './services/projects'
import { decodeShareCode, encodeShareCode } from './services/share'
import { type Project, projectMeta } from './services/types'
import {
  clearFromLocalStorage,
  copyProjectToClipboard,
  exportAsZip,
  getLanguageFromPath,
  saveToLocalStorage,
} from './services/utils'

// a dev server that crashes on boot exits without ever firing server-ready —
// release the "Starting server..." spinner if nothing shows up in time
const SERVER_START_TIMEOUT_MS = 20_000

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
    createFile,
    createFolder,
    deleteItem,
    isInstalling,
    isShellReady,
    isStopping,
    moveItem,
    prepareProject,
    previewUrl,
    renameItem,
    runCommand,
    setPreviewUrl,
    stopCommand,
    setupFileWatcher,
    webcontainer,
    writeFile,
  } = useWebContainer()

  const {
    deselect,
    error,
    isLoading,
    playgroundConfig,
    select: setSelectedProject,
    selectedProject,
    syncFiles,
    updateFile,
  } = useProjectStore()

  // run/prepare/name live in the workspace manifest, parsed once by the store
  const runConfig = playgroundConfig?.run

  const currentFile = useCurrentFile()
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false)
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  const terminalPanelRef = useRef<ImperativePanelHandle>(null)
  const restoreTerminalSize = useRef(30)
  const publishStatus = useStatusBar((s) => s.publish)
  const clearStatus = useStatusBar((s) => s.clear)
  const { isPanelVisible, toggleEditor } = usePanelVisible()
  const { openTab, closeTab } = useEditorTabs()

  const [monaco, setMonaco] = useState<Monaco | null>(null)

  const isMobile = useMobile()

  useTypeLoader(monaco, webcontainer, isInstalling, selectedProject?.id)

  const handleExportZip = useCallback(async () => {
    if (!selectedProject) return

    try {
      await exportAsZip(
        selectedProject.files,
        projectMeta(selectedProject).name
      )

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
  }, [selectedProject])

  const handleSave = useCallback(async () => {
    if (!selectedProject) return

    try {
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
  }, [selectedProject])

  const handleCopy = useCallback(async () => {
    if (!selectedProject) return

    try {
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
  }, [selectedProject])

  const handleProjectSelect = useCallback(
    async (project: Project) => {
      // a running dev server would keep serving the previous project
      if (previewUrl || isRunning) {
        try {
          await stopCommand()
        } catch (error) {
          console.error('Error stopping server on project switch:', error)
        }
        setIsRunning(false)
      }

      setPreviewUrl(null)
      await setSelectedProject(project)

      // install dependencies in the project's own directory; UI state
      // (isInstalling, status bar) tracks it — no need to block here
      void prepareProject(project)
    },
    [
      previewUrl,
      isRunning,
      stopCommand,
      setPreviewUrl,
      setSelectedProject,
      prepareProject,
    ]
  )

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
  }, [selectedProject, handleProjectSelect])

  const handleFileSelect = (path: string) => {
    openTab(path)
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
        updateFile(currentFile.path, newContent)
      } catch (error) {
        console.error('Error writing file:', error)
      }
    }
  }

  const handleCreateFile = useCallback(
    async (path: string) => {
      await createFile(path)
      currentFile.setCurrentFile({ path, content: '' })
      openTab(path)
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
        closeTab(path)
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
    const run = runConfig
    if (!run) return

    // no shell yet, dependencies installing, or still cooling down from a
    // stop — the toolbar disables Run for all of these, this guards direct
    // calls
    if (!isShellReady || isInstalling || isStopping) return

    // one-shot script: no server lifecycle, output just streams to terminal
    if (run.server !== true) {
      try {
        await runCommand(run.command)
        toast('Running Command', { description: run.label ?? run.command })
      } catch (error) {
        console.error('Error running command:', error)
        toast.error('Run Failed', {
          description: `Failed to run ${run.label ?? run.command}`,
        })
      }
      return
    }

    // already running or starting — never queue a second dev server
    if (isRunning || previewUrl) return

    setIsRunning(true)

    try {
      await runCommand(run.command)

      toast('Starting Server', {
        description: run.label ?? run.command,
      })
    } catch (error) {
      console.error('Error running command:', error)
      toast.error('Run Failed', {
        description: 'Failed to start dev server',
      })
      setIsRunning(false)
    }
  }, [
    runConfig,
    isShellReady,
    isInstalling,
    isStopping,
    isRunning,
    previewUrl,
    runCommand,
  ])

  const handleStopCommand = useCallback(async () => {
    try {
      await stopCommand()
      setIsRunning(false)

      toast('Server Stopped', {
        description: 'Dev server was interrupted',
      })
    } catch (error) {
      console.error('Error stopping server:', error)
      toast.error('Stop Failed', {
        description: 'Failed to stop dev server',
      })
    }
  }, [stopCommand])

  // the spinner runs from click until the server announces itself
  useEffect(() => {
    if (previewUrl) setIsRunning(false)
  }, [previewUrl])

  // watchdog: a stuck start (run line swallowed, server crashed on boot)
  // never fires server-ready — release the spinner instead of waiting forever
  useEffect(() => {
    if (!isRunning) return

    const timer = setTimeout(() => {
      setIsRunning(false)
      toast.error('Server Not Detected', {
        description: 'No server became ready — check the terminal output.',
      })
    }, SERVER_START_TIMEOUT_MS)

    return () => clearTimeout(timer)
  }, [isRunning])

  // the server status only exists once a run is attempted — projects that
  // never start a server never see server chrome
  useEffect(() => {
    if (isStopping) {
      publishStatus({
        id: 'server',
        label: 'Stopping server...',
        tone: 'info',
        busy: true,
      })
    } else if (previewUrl) {
      publishStatus({
        id: 'server',
        label: 'Server running',
        tone: 'success',
        kind: 'indicator',
      })
    } else if (isRunning) {
      publishStatus({
        id: 'server',
        label: 'Starting server...',
        tone: 'info',
        busy: true,
      })
    } else {
      clearStatus('server')
    }
  }, [previewUrl, isRunning, isStopping, publishStatus, clearStatus])

  const toggleTerminalMaximize = useCallback(() => {
    const panel = terminalPanelRef.current
    if (!panel) return

    if (isTerminalMaximized) {
      setIsTerminalMaximized(false)
      requestAnimationFrame(() => panel.resize(restoreTerminalSize.current))
    } else {
      restoreTerminalSize.current = panel.getSize()
      setIsTerminalMaximized(true)
      // the relaxed size constraints only apply after the re-render
      requestAnimationFrame(() => panel.resize(100))
    }
  }, [isTerminalMaximized])

  const handleShare = useCallback(async () => {
    if (!selectedProject) return

    try {
      // selectedProject.files is kept in sync with the container by the
      // file watcher, so this snapshot includes unsaved work — the manifest
      // rides inside it, so run config travels with the link by construction
      const code = await encodeShareCode(selectedProject)
      const url = `${window.location.origin}${window.location.pathname}?code=${code}`

      if (url.length > 8000) {
        toast.error('Too Large to Share', {
          description: 'This project exceeds what a link can carry',
        })
        return
      }

      await navigator.clipboard.writeText(url)
      toast('Share Link Copied', {
        description: 'Anyone with the link opens this exact project',
      })
    } catch (error) {
      console.error('Error sharing project:', error)
      toast.error('Share Failed', {
        description: 'Could not create a share link',
      })
    }
  }, [selectedProject])

  // open a shared project from a ?code= link (once, on first load)
  const sharedImportRef = useRef(false)
  useEffect(() => {
    if (sharedImportRef.current) return
    sharedImportRef.current = true

    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) return

    decodeShareCode(code)
      .then((project) => {
        // a distinct id keeps localStorage saves of the original example
        // from shadowing the shared content
        const shared = { ...project, id: `shared-${project.id}` }
        clearFromLocalStorage(shared.id)
        return handleProjectSelect(shared)
      })
      .catch((error) => {
        console.error('Share import failed:', error)
        toast.error('Invalid Share Link', {
          description: 'Could not decode the shared project',
        })
      })
  }, [handleProjectSelect])

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
    const dispose = setupFileWatcher((snapshot) => {
      void syncFiles(snapshot)
    })

    return dispose
  }, [setupFileWatcher, syncFiles])

  if (isMobile) {
    return (
      <MobileView
        projectName={
          selectedProject ? projectMeta(selectedProject).name : undefined
        }
        onBack={selectedProject ? () => deselect() : undefined}
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
            onClick={deselect}
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
          onRunCommand={runConfig ? handleRunCommand : undefined}
          runLabel={runConfig?.label ?? runConfig?.command}
          onStopCommand={handleStopCommand}
          onShare={handleShare}
          isRunning={isRunning}
          isStopping={isStopping}
          isInstalling={isInstalling}
          isShellReady={isShellReady}
          isServerRunning={!!previewUrl}
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
                onClick={deselect}
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
          <Panel
            defaultSize={70}
            minSize={isTerminalMaximized ? 0 : 30}
            id="top-panel"
          >
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
                          <EditorTabs files={selectedProject?.files} />
                          {/* min-h-0 lets this shrink when the terminal grows —
                              without it Monaco's own height locks the flex item
                              and automaticLayout never sees the resize */}
                          <div className="flex-1 min-h-0">
                            <CodeEditor
                              value={currentFile.content}
                              onChange={handleFileChange}
                              language={getLanguageFromPath(currentFile.path)}
                              filePath={currentFile.path}
                              files={selectedProject?.files}
                              onMonacoReady={setMonaco}
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
            ref={terminalPanelRef}
            defaultSize={30}
            minSize={15}
            maxSize={isTerminalMaximized ? 100 : 50}
            onResize={(size) => {
              // dragging the handle back down exits maximized mode
              if (isTerminalMaximized && size < 95) {
                setIsTerminalMaximized(false)
              }
            }}
            className={isPanelVisible('terminal') ? '' : 'hidden'}
          >
            <div className="h-full border-t border-border/50 bg-background flex flex-col">
              <div className="h-10 border-b border-border/50 flex items-center gap-3 px-4 shrink-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Terminal
                </span>
                <StatusBar />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTerminalMaximize}
                  className="h-6 px-1.5 hover:bg-muted"
                  title={
                    isTerminalMaximized
                      ? 'Restore terminal'
                      : 'Maximize terminal'
                  }
                >
                  {isTerminalMaximized ? (
                    <ChevronsDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronsUp className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Terminal />
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
