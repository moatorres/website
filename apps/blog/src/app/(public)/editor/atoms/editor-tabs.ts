import { create } from 'zustand'

import { useCurrentFile } from './current-file'

interface TabsState {
  openTabs: string[]
  activeTab: string | null

  openTab: (path: string) => void
  closeTab: (path: string) => void
  closeAllTabs: () => void
  switchTab: (path: string) => void
}

export const useEditorTabs = create<TabsState>((set, get) => ({
  openTabs: [],
  activeTab: null,

  openTab: (path) => {
    const { setPath } = useCurrentFile.getState()

    set((state) => ({
      openTabs: state.openTabs.includes(path)
        ? state.openTabs
        : [...state.openTabs, path],
      activeTab: path,
    }))

    setPath(path)
  },

  closeTab: (path) => {
    const { activeTab, openTabs } = get()
    const { setPath } = useCurrentFile.getState()

    const newTabs = openTabs.filter((t) => t !== path)

    let next: string | null = activeTab
    if (path === activeTab) {
      if (newTabs.length > 0) {
        const idx = openTabs.indexOf(path)
        next = newTabs[Math.max(0, idx - 1)]
      } else {
        next = null
      }
      setPath(next)
    }

    set({ openTabs: newTabs, activeTab: next })
  },

  closeAllTabs: () => {
    const { setPath } = useCurrentFile.getState()
    setPath(null)
    set({ openTabs: [], activeTab: null })
  },

  switchTab: (path) => {
    const { setPath } = useCurrentFile.getState()
    setPath(path)
    set({ activeTab: path })
  },
}))
