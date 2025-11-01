'use client'

import type { WebContainer } from '@webcontainer/api'

let webcontainerInstance: WebContainer | null = null
let isBooting = false
let bootPromise: Promise<WebContainer> | null = null

export function resetWebContainerInstance() {
  console.log('[v0] Resetting WebContainer instance')
  webcontainerInstance = null
  isBooting = false
  bootPromise = null
}

export async function getWebContainerInstance(): Promise<WebContainer> {
  if (typeof crossOriginIsolated !== 'undefined' && !crossOriginIsolated) {
    throw new Error(
      'Cross-Origin Isolation is not enabled. WebContainers require COOP and COEP headers to be set.'
    )
  }

  if (webcontainerInstance) {
    console.log('[v0] Reusing existing WebContainer instance')
    return webcontainerInstance
  }

  if (isBooting && bootPromise) {
    console.log('[v0] Waiting for existing boot process')
    return bootPromise
  }

  isBooting = true
  console.log('[v0] Booting new WebContainer instance')

  bootPromise = (async () => {
    try {
      const { WebContainer } = await import('@webcontainer/api')
      const instance = await WebContainer.boot()
      webcontainerInstance = instance
      console.log('[v0] WebContainer booted successfully')
      return instance
    } catch (error) {
      console.error('[v0] Failed to boot WebContainer:', error)
      resetWebContainerInstance()
      throw error
    } finally {
      isBooting = false
      bootPromise = null
    }
  })()

  return bootPromise
}

export async function clearFileSystem(instance: WebContainer) {
  try {
    const files = await instance.fs.readdir('/', { withFileTypes: true })
    for (const file of files) {
      try {
        await instance.fs.rm(file.name, { recursive: true, force: true })
      } catch (error) {
        console.log(`[v0] Could not remove ${file.name}:`, error)
      }
    }
  } catch (error) {
    console.error('[v0] Error clearing file system:', error)
  }
}

export function convertFilesToFileTree(files: Record<string, string>) {
  const tree: any = {}

  for (const [path, content] of Object.entries(files)) {
    const parts = path.split('/')
    let current = tree

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1

      if (isFile) {
        current[part] = {
          file: {
            contents: content,
          },
        }
      } else {
        if (!current[part]) {
          current[part] = {
            directory: {},
          }
        }
        current = current[part].directory
      }
    }
  }

  return tree
}

export async function readAllFiles(instance: WebContainer): Promise<{
  files: Record<string, string>
  directories: string[]
}> {
  const files: Record<string, string> = {}
  const directories: string[] = []

  async function readDir(path: string) {
    try {
      const entries = await instance.fs.readdir(path, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath =
          path === '/' ? `/${entry.name}` : `${path}/${entry.name}`
        const relativePath = fullPath.startsWith('/')
          ? fullPath.slice(1)
          : fullPath

        // Skip node_modules and hidden files
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue
        }

        if (entry.isDirectory()) {
          directories.push(relativePath)
          await readDir(fullPath)
        } else if (entry.isFile()) {
          try {
            const content = await instance.fs.readFile(fullPath, 'utf-8')
            files[relativePath] = content
          } catch (error) {
            console.error(`[v0] Error reading file ${fullPath}:`, error)
          }
        }
      }
    } catch (error) {
      console.error(`[v0] Error reading directory ${path}:`, error)
    }
  }

  await readDir('/')

  return { files, directories }
}

export function watchFileSystem(
  instance: WebContainer,
  callback: (data: {
    files: Record<string, string>
    directories: string[]
  }) => void
): () => void {
  const watchers: Array<{ close: () => void }> = []
  let isProcessing = false

  async function handleChange(
    eventType: string,
    filename: string | Uint8Array<ArrayBufferLike> | null
  ) {
    // Debounce rapid changes
    if (isProcessing) return
    isProcessing = true

    console.log(
      `[v0] File system change detected: ${eventType} ${filename || ''}`
    )

    try {
      // Re-read all files from WebContainer
      const data = await readAllFiles(instance)
      console.log(
        `[v0] Re-read ${Object.keys(data.files).length} files and ${data.directories.length} directories from WebContainer`
      )
      callback(data)
    } catch (error) {
      console.error('[v0] Error reading files after change:', error)
    } finally {
      // Allow next change to be processed after a short delay
      setTimeout(() => {
        isProcessing = false
      }, 100)
    }
  }

  // Watch root directory recursively
  try {
    console.log(
      '[v0] Setting up recursive file system watcher on root directory'
    )

    const watcher = instance.fs.watch('/', { recursive: true }, handleChange)

    watchers.push({
      close: () => {
        try {
          watcher.close()
          console.log('[v0] Closed root directory watcher')
        } catch (error) {
          console.error('[v0] Error closing watcher:', error)
        }
      },
    })
  } catch (error) {
    console.error('[v0] Error setting up file system watcher:', error)
  }

  // Return cleanup function
  return () => {
    console.log('[v0] Cleaning up file system watchers')
    watchers.forEach((watcher) => watcher.close())
  }
}
