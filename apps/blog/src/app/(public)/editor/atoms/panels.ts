import { atom, useAtomValue, useSetAtom } from 'jotai'

type Panel = 'preview' | 'explorer' | 'editor' | 'terminal'

type PanelsAtomValue = { [Key in Panel]: boolean }

export const panelsAtom = atom<PanelsAtomValue>({
  editor: true,
  explorer: true,
  preview: true,
  terminal: true,
})

export function usePanelVisible() {
  const panels = useAtomValue(panelsAtom)
  const setPanels = useSetAtom(panelsAtom)

  const isPanelVisible = (panel: Panel) => panels[panel]
  const togglePanelHandler = (panel: Panel) => () =>
    setPanels((s) => ({ ...s, [panel]: !s[panel] }))

  const toggleEditor = togglePanelHandler('editor')
  const toggleExplorer = togglePanelHandler('explorer')
  const togglePreview = togglePanelHandler('preview')
  const toggleTerminal = togglePanelHandler('terminal')

  return [
    isPanelVisible,
    {
      toggleEditor,
      toggleExplorer,
      togglePreview,
      toggleTerminal,
    },
  ] as const
}
