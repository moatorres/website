import { atom, useAtomValue, useSetAtom } from 'jotai'

// --- Files ----------------------------------------------

type CurrentFileAtomValue = {
  path: string | null
  content: string
}

export const currentFileAtom = atom<CurrentFileAtomValue>({
  path: null,
  content: '',
})

export function useCurrentFile() {
  const currentFile = useAtomValue(currentFileAtom)
  const setCurrentFile = useSetAtom(currentFileAtom)

  const setPath = (path: string | null) =>
    setCurrentFile((state) => ({ ...state, path }))
  const setContent = (content: string) =>
    setCurrentFile((state) => ({ ...state, content }))
  const clear = () => setCurrentFile((state) => ({ path: null, content: '' }))

  return {
    path: currentFile.path,
    content: currentFile.content,
    clear,
    setPath,
    setContent,
    setCurrentFile,
  } as const
}
