import { Effect } from 'effect'
import { toast } from 'sonner'
import { create } from 'zustand'

import { exampleProjects } from '../services/projects'
import { wcRuntime } from '../services/runtime'
import {
  type FileNode,
  initialFileOf,
  parsePlaygroundConfig,
  PLAYGROUND_CONFIG_FILE,
  type PlaygroundConfig,
  type Project,
} from '../services/types'
import {
  buildFileTree,
  clearFromLocalStorage,
  loadFromLocalStorage,
} from '../services/utils'
import { WebContainerService } from '../services/WebContainerService'

import { useCurrentFile } from './current-file'
import { useEditorTabs } from './editor-tabs.js'

interface ProjectState {
  selectedProject: Project | null
  /** parsed workspace manifest (playground.json); null when absent */
  playgroundConfig: PlaygroundConfig | null
  fileTree: FileNode[]
  isLoading: boolean
  error: string | null

  select(project: Project): Promise<void>
  deselect(): void
  clearError(): void
  /** Update a single file's content in state without reloading the project */
  updateFile(path: string, content: string): void
  syncFiles(options?: {
    files: Record<string, string>
    directories: string[]
  }): Promise<void>
  setFileTree(tree: FileNode[]): void
  reset(): Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  selectedProject: null,
  playgroundConfig: null,
  fileTree: [],
  isLoading: false,
  error: null,

  setFileTree: (fileTree) => set({ fileTree }),

  clearError: () => set({ error: null }),

  updateFile: (path, content) => {
    const { selectedProject, playgroundConfig } = get()
    if (!selectedProject) return
    const files = { ...selectedProject.files, [path]: content }
    set({
      selectedProject: { ...selectedProject, files },
      playgroundConfig:
        path === PLAYGROUND_CONFIG_FILE
          ? parsePlaygroundConfig(files, playgroundConfig)
          : playgroundConfig,
    })
  },

  deselect: () =>
    set({
      selectedProject: null,
      playgroundConfig: null,
      error: null,
      fileTree: [],
      isLoading: false,
    }),

  select: async (project) => {
    const currentFile = useCurrentFile.getState()
    const editor = useEditorTabs.getState()

    set({ isLoading: true, error: null })

    currentFile.clear()
    editor.closeAllTabs()

    try {
      // restore saved project version
      const saved = loadFromLocalStorage(project.id)
      const projectToLoad = saved ? { ...project, files: saved } : project

      if (saved) {
        toast('Loaded Saved Version', {
          description: 'Restored your previous changes',
          dismissible: true,
        })
      }

      const config = parsePlaygroundConfig(projectToLoad.files)
      set({
        selectedProject: projectToLoad,
        playgroundConfig: config,
        fileTree: buildFileTree(projectToLoad.files),
      })

      // mounts into the project's own directory and marks it active — other
      // projects' directories (and their installed node_modules) survive
      await wcRuntime.runPromise(
        Effect.flatMap(WebContainerService, (svc) => svc.mount(projectToLoad))
      )

      const initialFile = initialFileOf(projectToLoad.files, config)
      currentFile.setCurrentFile({
        path: initialFile,
        content: projectToLoad.files[initialFile],
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      set({ error: msg })
    } finally {
      set({ isLoading: false })
    }
  },

  syncFiles: async (options) => {
    const currentFile = useCurrentFile.getState()
    const { selectedProject, isLoading } = get()

    if (!selectedProject || isLoading) return

    if (options) {
      try {
        const { files, directories } = options

        set({
          selectedProject: { ...selectedProject, files },
          playgroundConfig: parsePlaygroundConfig(files, get().playgroundConfig),
          fileTree: buildFileTree(files, directories),
        })

        return currentFile.sync(files)
      } catch (err) {
        console.error('syncFiles failed:', err)
      }
    }

    try {
      const { files, directories } = await wcRuntime.runPromise(
        Effect.flatMap(WebContainerService, (svc) => svc.readAllFiles())
      )

      set({
        selectedProject: { ...selectedProject, files },
        fileTree: buildFileTree(files, directories),
      })

      currentFile.sync(files)
    } catch (err) {
      console.error('syncFiles failed:', err)
    }
  },

  reset: async () => {
    const { selectedProject } = get()
    if (!selectedProject) return

    clearFromLocalStorage(selectedProject.id)

    toast('Resetting Project', {
      description: 'Clearing saved changes and reloading original...',
    })

    const original = exampleProjects.find((p) => p.id === selectedProject.id)
    if (!original) return

    await get().select(original)

    toast('Project Reset', {
      description: 'Project has been reset to original state',
    })
  },
}))
