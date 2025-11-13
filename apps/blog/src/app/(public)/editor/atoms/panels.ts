import { create } from 'zustand'

type Panel = 'preview' | 'explorer' | 'editor' | 'terminal'

interface PanelsState {
  panels: Record<Panel, boolean>
  togglePanel: (panel: Panel) => void

  isPanelVisible: (panel: Panel) => boolean
  toggleEditor: () => void
  toggleExplorer: () => void
  togglePreview: () => void
  toggleTerminal: () => void
}

export const usePanelVisible = create<PanelsState>((set, get) => ({
  panels: {
    editor: true,
    explorer: true,
    preview: true,
    terminal: true,
  },

  isPanelVisible: (panel) => get().panels[panel],

  togglePanel: (panel) =>
    set((state) => ({
      panels: { ...state.panels, [panel]: !state.panels[panel] },
    })),

  toggleEditor: () => get().togglePanel('editor'),
  toggleExplorer: () => get().togglePanel('explorer'),
  togglePreview: () => get().togglePanel('preview'),
  toggleTerminal: () => get().togglePanel('terminal'),
}))
