'use client'

import { print } from '@blog/utils'
import type { WebContainer } from '@webcontainer/api'

let webcontainerInstance: WebContainer | null = null
let isBooting = false
let bootPromise: Promise<WebContainer> | null = null

export function resetWebContainerInstance() {
  print.log('Resetting WebContainer instance')
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
    print.log('Reusing existing WebContainer instance')
    return webcontainerInstance
  }

  if (isBooting && bootPromise) {
    print.log('Waiting for existing boot process')
    return bootPromise
  }

  isBooting = true
  print.log('Booting new WebContainer instance')

  bootPromise = (async () => {
    try {
      const { WebContainer } = await import('@webcontainer/api')
      const instance = await WebContainer.boot()
      webcontainerInstance = instance
      print.log('WebContainer booted successfully')
      return instance
    } catch (error) {
      print.error('Failed to boot WebContainer:', error)
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
        print.log(`Could not remove ${file.name}:`, error)
      }
    }
  } catch (error) {
    print.error('Error clearing file system:', error)
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
            print.error(`Error reading file ${fullPath}:`, error)
          }
        }
      }
    } catch (error) {
      print.error(`Error reading directory ${path}:`, error)
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
  }) => void,
  options?: { ignoreIf?: () => boolean }
): () => void {
  const watchers: Array<{ close: () => void }> = []

  let isProcessing = false

  async function handleChange(
    eventType: string,
    filename: string | Uint8Array<ArrayBufferLike> | null
  ) {
    // Respect an external ignore predicate (e.g. while installing)
    if (options?.ignoreIf?.()) {
      print.log('Skipping FS change processing (ignored by predicate)')
      return
    }

    if (isProcessing) return

    isProcessing = true

    print.log(`File system change detected: ${eventType} ${filename || ''}`)

    try {
      const data = await readAllFiles(instance)
      print.log(
        `Re-read ${Object.keys(data.files).length} files and ${data.directories.length} directories from WebContainer`
      )
      callback(data)
    } catch (error) {
      print.error('Error reading files after change:', error)
    } finally {
      setTimeout(() => {
        isProcessing = false
      }, 200) // small increase to give pnpm a chance to flush many rapid events
    }
  }

  try {
    print.log('Setting up recursive file system watcher on root directory')

    const watcher = instance.fs.watch('/', { recursive: true }, handleChange)

    watchers.push({
      close: () => {
        try {
          watcher.close()
          print.log('Closed root directory watcher')
        } catch (error) {
          print.error('Error closing watcher:', error)
        }
      },
    })
  } catch (error) {
    print.error('Error setting up file system watcher:', error)
  }

  return () => {
    print.log('Cleaning up file system watchers')
    watchers.forEach((watcher) => watcher.close())
  }
}
