import { Monaco } from '@monaco-editor/react'
import type { WebContainer } from '@webcontainer/api'
import { useCallback, useEffect, useRef } from 'react'

import { useStatusBar } from '../atoms/status'

import { useDebounce } from './use-debounce'

const DEBOUNCE_MS = 100

const loadedTypeHashes = new Map<string, string>()

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

/**
 * Semantic diagnostics recompute on every addExtraLib batch, so while types
 * stream in the module-not-found squiggles flicker. Semantic validation is
 * suppressed during install/type-load and re-enabled for a single clean pass
 * once loading settles. Syntax validation stays on — it needs no types.
 */
function setSemanticValidation(monaco: Monaco, enabled: boolean) {
  const options = { noSemanticValidation: !enabled, noSyntaxValidation: false }
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(options)
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(options)
}

function publishTypesLoading() {
  useStatusBar.getState().publish({
    id: 'types',
    label: 'Loading types...',
    tone: 'info',
    busy: true,
  })
}

function publishTypesLoaded() {
  useStatusBar
    .getState()
    .publish(
      { id: 'types', label: 'Types loaded', tone: 'success' },
      { ttl: 3000 }
    )
}

export function useTypeLoader(
  monaco: Monaco | null,
  wc: WebContainer | null,
  isInstalling: boolean,
  /** active project directory — types are scanned from its node_modules */
  projectDir?: string
) {
  const isLoadingRef = useRef(false)
  const pendingRef = useRef(false)
  const ignoreInstallRef = useRef(isInstalling)

  const typesBasePath = projectDir
    ? `/${projectDir}/node_modules/.pnpm`
    : '/node_modules/.pnpm'

  const scheduleLoad = useCallback(async () => {
    if (!monaco || !wc) return
    if (isLoadingRef.current) {
      pendingRef.current = true
      return
    }

    isLoadingRef.current = true
    setSemanticValidation(monaco, false)
    publishTypesLoading()
    try {
      await loadTypeDefinitions(monaco, wc, typesBasePath)
    } finally {
      isLoadingRef.current = false
      if (pendingRef.current) {
        pendingRef.current = false
        setTimeout(() => scheduleLoad(), DEBOUNCE_MS)
      } else if (!ignoreInstallRef.current) {
        // while an install is still running this load saw a partial
        // node_modules — stay suppressed; the post-install reload re-enables
        setSemanticValidation(monaco, true)
        publishTypesLoaded()
      }
    }
  }, [monaco, wc, typesBasePath])

  const reloadTypes = useCallback(async () => {
    if (!monaco || !wc) return
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setSemanticValidation(monaco, false)
    publishTypesLoading()

    try {
      console.log('[TypeLoader] Dependencies changed, reloading types.')
      await loadTypeDefinitions(monaco, wc, typesBasePath)
    } finally {
      isLoadingRef.current = false
      if (pendingRef.current) {
        pendingRef.current = false
        setTimeout(() => scheduleLoad(), 250)
      } else if (!ignoreInstallRef.current) {
        setSemanticValidation(monaco, true)
        publishTypesLoaded()
      }
    }
  }, [monaco, wc, typesBasePath, scheduleLoad])

  const reloadTypeDefintions = useDebounce(reloadTypes, DEBOUNCE_MS)

  useEffect(() => {
    ignoreInstallRef.current = isInstalling
  }, [isInstalling])

  // suppress module-resolution squiggles while dependencies are installing;
  // when the install finishes, one reload brings validation back — dep-file
  // events during the install are ignored (see onChange), so nothing else
  // would trigger it
  useEffect(() => {
    if (!monaco) return
    if (isInstalling) {
      setSemanticValidation(monaco, false)
    } else if (wc) {
      reloadTypeDefintions()
    }
  }, [monaco, wc, isInstalling, reloadTypeDefintions])

  useEffect(() => {
    if (!wc || !monaco) return
    const decoder = new TextDecoder()

    const refreshOpenModel = async (name: string) => {
      try {
        const models = monaco.editor.getModels()
        await Promise.all(
          models.map(async (model) => {
            // models use workspace-relative paths; watch events are
            // container-absolute (prefixed with the project directory)
            const path = model.uri.path.replace(/^\//, '')
            if (name.includes('package.json') && name.endsWith(path)) {
              const content = await wc.fs.readFile(name, 'utf-8')
              if (model.getValue() !== content) {
                model.setValue(content)
                console.log(`[TypeLoader] Refreshed content of ${path}`)
              }
            }
          })
        )
      } catch (err) {
        console.warn('[TypeLoader] Model refresh failed:', err)
      }
    }

    const onChange = (
      _type: string,
      filename: string | Uint8Array<ArrayBufferLike> | null
    ) => {
      if (!filename) return
      const name =
        typeof filename === 'string' ? filename : decoder.decode(filename)

      // ignore events from other projects' directories
      if (projectDir && !name.startsWith(`${projectDir}/`)) return

      refreshOpenModel(name)

      if (!DEP_FILES.some((f) => name.endsWith(f))) return

      // install churn rewrites lockfiles constantly and node_modules is
      // incomplete anyway — the isInstalling effect reloads once it settles
      if (ignoreInstallRef.current) return

      console.debug(`[TypeLoader] File ${name} changed`)

      reloadTypeDefintions()
    }

    const watcher = wc.fs.watch('/', { recursive: true }, onChange)

    return () => {
      watcher.close()
    }
  }, [wc, monaco, projectDir, reloadTypeDefintions])

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
  console.log('[TypeLoader] Scanning for .d.ts files...')
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
  console.log(`[TypeLoader] Queued ${fileQueue.length} types`)

  const newTypeHashes = new Map<string, string>()

  let reused = 0

  for (let i = 0; i < fileQueue.length; i += batchSize) {
    const batch = fileQueue.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async ({ path, virtualPath }) => {
        try {
          const content = await webcontainer.fs.readFile(path, 'utf-8')
          const hashBuffer = await crypto.subtle.digest(
            'SHA-1',
            new TextEncoder().encode(content)
          )
          const hashHex = Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')

          newTypeHashes.set(virtualPath, hashHex)

          // unchanged → skip
          if (loadedTypeHashes.get(virtualPath) === hashHex) {
            reused++
            return
          }

          const existing = monacoTypeDisposables.get(virtualPath)

          if (existing) existing.dispose()

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
              d1.dispose()
              d2.dispose()
            },
          })
        } catch (e) {
          console.warn(`[TypeLoader] Failed to read or add ${path}:`, e)
        }
      })
    )

    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
  }

  for (const [vpath, dlib] of monacoTypeDisposables.entries()) {
    if (!newTypeHashes.has(vpath)) {
      dlib.dispose()
      monacoTypeDisposables.delete(vpath)
      loadedTypeHashes.delete(vpath)
    }
  }

  loadedTypeHashes.clear()

  for (const [k, v] of newTypeHashes.entries()) loadedTypeHashes.set(k, v)

  console.log(
    `[TypeLoader] Reused ${reused} of ${loadedTypeHashes.size} project types.`
  )
}
