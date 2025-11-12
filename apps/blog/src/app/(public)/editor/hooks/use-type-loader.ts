import { Monaco } from '@monaco-editor/react'
import type { WebContainer } from '@webcontainer/api'
import { useCallback, useEffect, useRef } from 'react'

const monacoTypeDisposables = new Map<string, { dispose: () => void }>()

function clearLoadedTypeDefinitions() {
  for (const [, d] of monacoTypeDisposables) {
    try {
      d.dispose()
    } catch (error) {
      console.error('Error disposing library', error)
    }
  }
  monacoTypeDisposables.clear()
}

const DEP_FILES = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml']

export function useTypeLoader(
  monaco: Monaco | null,
  wc: WebContainer | null,
  isInstalling: boolean
) {
  const isLoadingRef = useRef(false)
  const pendingRef = useRef(false)
  const ignoreInstallRef = useRef(isInstalling)
  const debounceTimer = useRef<number | null>(null)

  const scheduleLoad = useCallback(async () => {
    if (!monaco || !wc) return
    if (isLoadingRef.current) {
      pendingRef.current = true
      return
    }

    isLoadingRef.current = true
    try {
      await loadTypeDefinitions(monaco, wc)
    } finally {
      isLoadingRef.current = false
      if (pendingRef.current) {
        pendingRef.current = false
        setTimeout(() => scheduleLoad(), 250)
      }
    }
  }, [monaco, wc])

  const reloadTypes = useCallback(async () => {
    if (!monaco || !wc) return
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    try {
      console.log('Dependencies changed, reloading types.')
      await loadTypeDefinitions(monaco, wc)
    } finally {
      isLoadingRef.current = false
      if (pendingRef.current) {
        pendingRef.current = false
        setTimeout(() => scheduleLoad(), 250)
      }
    }
  }, [monaco, wc, scheduleLoad])

  useEffect(() => {
    ignoreInstallRef.current = isInstalling
  }, [isInstalling])

  useEffect(() => {
    if (!wc || !monaco) return
    const decoder = new TextDecoder()

    const refreshOpenModel = async (name: string) => {
      try {
        const models = monaco.editor.getModels()
        await Promise.all(
          models.map(async (model) => {
            const path = model.uri.path.replace(/^\//, '')
            if (name.includes('package.json') && path.endsWith(name)) {
              const content = await wc.fs.readFile(path, 'utf-8')
              if (model.getValue() !== content) {
                model.setValue(content)
                console.log(`[useMonacoTypes] refreshed content of ${path}`)
              }
            }
          })
        )
      } catch (err) {
        console.warn('[useMonacoTypes] model refresh failed:', err)
      }
    }

    const onChange = (
      _type: string,
      filename: string | Uint8Array<ArrayBufferLike> | null
    ) => {
      if (!filename) return
      const name =
        typeof filename === 'string' ? filename : decoder.decode(filename)
      refreshOpenModel(name)

      if (!DEP_FILES.some((f) => name.endsWith(f))) return

      console.debug(`File ${name} changed`)

      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = window.setTimeout(() => {
        reloadTypes()
      }, 3000)
    }

    const watcher = wc.fs.watch('/', { recursive: true }, onChange)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      watcher.close()
    }
  }, [wc, monaco, reloadTypes])

  // Dispose libraries on unmount
  useEffect(() => {
    return () => {
      clearLoadedTypeDefinitions()
    }
  }, [])
}

/**
 * Load .d.ts files into Monaco in a memory-safe, batched way.
 */
export async function loadTypeDefinitions(
  monaco: Monaco,
  webcontainer: WebContainer,
  basePath = '/node_modules/.pnpm',
  batchSize = 50,
  delayMs = 10
) {
  console.log('Scanning for .d.ts files...')

  const fileQueue: { path: string; virtualPath: string }[] = []

  async function scanDir(dir: string) {
    let entries
    try {
      entries = await webcontainer.fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`
      if (entry.isDirectory()) {
        await scanDir(fullPath)
      } else if (
        entry.name.endsWith('.d.ts') ||
        entry.name === 'package.json'
      ) {
        const normalized = fullPath.replace(
          /.*\/node_modules\//,
          '/node_modules/'
        )
        const virtualPath = `file://${normalized}`
        fileQueue.push({ path: fullPath, virtualPath })
      }
    }
  }

  await scanDir(basePath)

  console.log(`Queued ${fileQueue.length} type files for Monaco`)

  clearLoadedTypeDefinitions()

  // Batch processing
  for (let i = 0; i < fileQueue.length; i += batchSize) {
    const batch = fileQueue.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async ({ path, virtualPath }) => {
        try {
          const content = await webcontainer.fs.readFile(path, 'utf-8')

          // Dispose previous definitions for this path
          const existing = monacoTypeDisposables.get(virtualPath)

          if (existing) {
            try {
              existing.dispose()
            } catch (error) {
              console.error('Error disposing library', error)
            }
            monacoTypeDisposables.delete(virtualPath)
          }

          const d1 = monaco.languages.typescript.typescriptDefaults.addExtraLib(
            content,
            virtualPath
          )
          const d2 = monaco.languages.typescript.javascriptDefaults.addExtraLib(
            content,
            virtualPath
          )

          monacoTypeDisposables.set(virtualPath, {
            dispose: () => {
              try {
                d1.dispose()
                d2.dispose()
              } catch (error) {
                console.error('Error disposing library', error)
              }
            },
          })
        } catch (e) {
          console.warn(`Failed to read or add ${path}:`, e)
        }
      })
    )

    // Throttle between batches
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
  }

  console.log('Type definitions loaded.')

  await scanDir(basePath)
}
