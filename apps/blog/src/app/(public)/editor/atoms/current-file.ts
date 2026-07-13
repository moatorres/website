import { create } from 'zustand'

type CurrentFile = {
  path: string | null
  content: string
}

interface CurrentFileState extends CurrentFile {
  setPath: (path: string | null) => void
  setContent: (content: string) => void
  setCurrentFile: (file: CurrentFile) => void
  clear: () => void

  /**
   * Reconciles the current file with an external snapshot (filesystem
   * watcher or in-memory file map).
   *
   * The open editor is the source of truth for the current file: watcher
   * snapshots lag behind in-flight edits (write debounce + FS re-read), so
   * applying them here would reset the editor mid-typing. External content
   * is only adopted when nothing has been loaded yet (e.g. a file created
   * in the terminal and opened before its content was read) — navigation
   * flows set content explicitly via `setCurrentFile`.
   */
  sync: (files: Record<string, string>) => void
}

export const useCurrentFile = create<CurrentFileState>((set, get) => ({
  path: null,
  content: '',

  setPath: (path) => set((state) => ({ ...state, path })),
  setContent: (content) => set((state) => ({ ...state, content })),
  setCurrentFile: (file) => set(file),
  clear: () => set({ path: null, content: '' }),
  sync: (files) => {
    const { path, content } = get()
    if (path && files[path] !== undefined && content === '') {
      set({ content: files[path] })
    }
  },
}))
