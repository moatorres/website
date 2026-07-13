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
  if (typeof window === 'undefined') {
    throw new Error(
      'WebContainer can only boot in the browser — check for module-scope or server-side calls'
    )
  }

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
      // the workdir name is what jsh's ~-relative prompt shows; without it
      // the prompt leads with an auto-generated hash
      const instance = await WebContainer.boot({ workdirName: 'playground' })
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
