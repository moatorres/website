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
   * Safely synchronizes the editor’s current file content
   * with an external source of truth (e.g. filesystem watcher or in-memory file map).
   *
   * This guard prevents race conditions where:
   * - A previously opened file’s update event could overwrite the content
   *   of a newly opened file if the watcher fires mid-transition.
   * - The editor could display stale content for a file that was deleted or replaced.
   *
   * The method only applies updates when:
   *  - The current file has a valid `path`.
   *  - That path exists in the provided `files` map.
   *
   * Otherwise, it silently skips the sync, keeping the editor state consistent.
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
    const { path } = get()
    if (path && files[path]) set({ content: files[path] })
  },
}))
