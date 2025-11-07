import { print } from '@blog/utils'
import { Monaco } from '@monaco-editor/react'
import type { WebContainer } from '@webcontainer/api'
import { useCallback, useEffect, useRef } from 'react'

const monacoTypeDisposables = new Map<string, { dispose: () => void }>()

function clearLoadedTypeDefinitions() {
  for (const [, d] of monacoTypeDisposables) {
    try {
      d.dispose()
    } catch {
      // TODO: Handle error
    }
  }
  monacoTypeDisposables.clear()
}

export function useTypeLoader(
  monaco: Monaco | null,
  wc: WebContainer | null,
  isInstalling: boolean
) {
  const isLoadingRef = useRef(false)
  const pendingRef = useRef(false)
  const ignoreInstallRef = useRef(isInstalling)

  useEffect(() => {
    ignoreInstallRef.current = isInstalling
  }, [isInstalling])

  /* Serialized scheduler */
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

  /* Watch package.json for dependency changes */
  useEffect(() => {
    if (!wc || !monaco) return
    const decoder = new TextDecoder()

    const onChange = (
      _type: string,
      filename: string | Uint8Array<ArrayBufferLike> | null
    ) => {
      if (!filename) return
      const name =
        typeof filename === 'string' ? filename : decoder.decode(filename)
      if (name.endsWith('package.json') || name === 'package.json') {
        print.log('[useMonacoTypes] package.json changed — scheduling reload')
        scheduleLoad()
      }
    }

    const watcher = wc.fs.watch('/', { recursive: false }, onChange)
    return () => watcher.close()
  }, [wc, monaco, scheduleLoad])

  // useEffect(() => {
  //   if (!wc) return
  //   let debounceTimer: number | null = null

  //   const handler = () => {
  //     if (ignoreInstallRef.current) return
  //     if (debounceTimer) clearTimeout(debounceTimer)
  //     debounceTimer = window.setTimeout(() => scheduleLoad(), 500)
  //   }

  //   const watcher = wc.fs.watch('/', { recursive: true }, handler)
  //   return () => {
  //     if (debounceTimer) clearTimeout(debounceTimer)
  //     watcher.close()
  //   }
  // }, [wc, scheduleLoad])

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
  print.log('Scanning for .d.ts files (safe mode)...')

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
        // Only scan relevant node_modules packages to reduce memory
        // if (fullPath.includes('.pnpm')) {
        await scanDir(fullPath)
        // }
      } else if (
        entry.name.endsWith('.d.ts') ||
        entry.name === 'package.json'
      ) {
        // Create virtual path for Monaco
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

  print.log(`Queued ${fileQueue.length} type files for Monaco`)

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
            } catch {
              // TODO: Handle error
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
              } catch {
                // TODO: Handle error
              }
              try {
                d2.dispose()
              } catch {
                // TODO: Handle error
              }
            },
          })
        } catch (e) {
          print.warn(`Failed to read or add ${path}:`, e)
        }
      })
    )

    // Throttle between batches
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
  }

  print.log('Type definitions loaded safely.')
  await scanDir(basePath)
}
