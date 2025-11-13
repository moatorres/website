'use client'

import { create } from 'zustand'

interface NewItem {
  name: string
  path: string
  type: 'file' | 'folder' | null
}

interface FileTreeState {
  newItem: NewItem
  lastClickedItem: string | null
  highlightedFolderPath: string | null

  // actions
  setNewItem: (partial: Partial<NewItem>) => void
  resetNewItem: () => void
  setLastClickedItem: (v: string | null) => void
  setHighlightedFolderPath: (v: string | null) => void
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  newItem: { name: '', path: '', type: null },
  lastClickedItem: null,
  highlightedFolderPath: null,

  setNewItem: (partial) =>
    set((s) => ({ newItem: { ...s.newItem, ...partial } })),
  resetNewItem: () => set({ newItem: { name: '', path: '', type: null } }),
  setLastClickedItem: (v) => set({ lastClickedItem: v }),
  setHighlightedFolderPath: (v) => set({ highlightedFolderPath: v }),
}))

// --- DraggableNode --------------------------------------

interface DraggableNode {
  name: string
  isDirectory: boolean
  path: string
}

interface DraggableStore {
  name: string
  path: string
  active: boolean
  isDirectory: boolean
  set: (item: DraggableNode) => void
  reset: () => void
}

export const useDraggableNode = create<DraggableStore>((set) => ({
  name: '',
  path: '',
  active: false,
  isDirectory: false,
  set: (item) => set({ ...item, active: true }),
  reset: () => set({ name: '', path: '', isDirectory: false, active: false }),
}))
