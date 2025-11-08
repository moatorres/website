import { print } from '@blog/utils'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

import { FileNode } from './types'

export const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    html: 'html',
    css: 'css',
    md: 'markdown',
  }
  return languageMap[ext || ''] || 'plaintext'
}

const sortNodes = (nodes: FileNode[]): FileNode[] => {
  return nodes
    .sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'directory') return 1
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    })
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: sortNodes(node.children),
        }
      }
      return node
    })
}

export const buildFileTree = (
  files: Record<string, string>,
  directories: string[] = []
): FileNode[] => {
  const tree: FileNode[] = []
  const pathMap = new Map<string, FileNode>()

  for (const dirPath of directories) {
    const parts = dirPath.split('/')
    let currentPath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const parentPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (!pathMap.has(currentPath)) {
        const node: FileNode = {
          name: part,
          type: 'directory',
          path: currentPath,
          children: [],
        }

        pathMap.set(currentPath, node)

        if (parentPath) {
          const parent = pathMap.get(parentPath)
          if (parent && parent.children) {
            parent.children.push(node)
          }
        } else {
          tree.push(node)
        }
      }
    }
  }

  const sortedPaths = Object.keys(files).sort()

  for (const path of sortedPaths) {
    const parts = path.split('/')
    let currentPath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const parentPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (!pathMap.has(currentPath)) {
        const isFile = i === parts.length - 1
        const node: FileNode = {
          name: part,
          type: isFile ? 'file' : 'directory',
          path: currentPath,
          children: isFile ? undefined : [],
          content: isFile ? files[path] : undefined,
        }

        pathMap.set(currentPath, node)

        if (parentPath) {
          const parent = pathMap.get(parentPath)
          if (parent && parent.children) {
            parent.children.push(node)
          }
        } else {
          tree.push(node)
        }
      }
    }
  }

  return sortNodes(tree)
}

function filterSourceFiles(
  files: Record<string, string>
): Record<string, string> {
  const sourceFiles: Record<string, string> = {}

  // Patterns to exclude (generated files and dependencies)
  const excludePatterns = [
    /^node_modules\//,
    /^\.pnpm\//,
    // /^pnpm-lock\.yaml$/,
    /^package-lock\.json$/,
    /^yarn\.lock$/,
    /^dist\//,
    /^build\//,
    /^\.next\//,
    /^out\//,
    /^coverage\//,
    /^\.turbo\//,
  ]

  for (const [path, content] of Object.entries(files)) {
    // Check if path matches any exclude pattern
    const shouldExclude = excludePatterns.some((pattern) => pattern.test(path))

    if (!shouldExclude) {
      sourceFiles[path] = content
    }
  }

  print.log(
    `Filtered ${Object.keys(files).length} files to ${Object.keys(sourceFiles).length} source files`
  )
  return sourceFiles
}

export async function exportAsZip(
  files: Record<string, string>,
  projectName: string
) {
  const zip = new JSZip()

  // Add all files to the zip
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content)
  }

  // Generate the zip file
  const blob = await zip.generateAsync({ type: 'blob' })

  // Download the zip
  saveAs(blob, `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`)
}

export function saveToLocalStorage(
  projectId: string,
  files: Record<string, string>
) {
  try {
    const sourceFiles = filterSourceFiles(files)

    const key = `webcontainer-project-${projectId}`
    localStorage.setItem(key, JSON.stringify(sourceFiles))
    print.log(
      `Project saved to localStorage: ${key} (${Object.keys(sourceFiles).length} source files)`
    )
    return true
  } catch (error) {
    print.error('Error saving to localStorage:', error)
    return false
  }
}

export function loadFromLocalStorage(
  projectId: string
): Record<string, string> | null {
  try {
    const key = `webcontainer-project-${projectId}`
    const data = localStorage.getItem(key)
    if (data) {
      print.log(`Project loaded from localStorage: ${key}`)
      return JSON.parse(data)
    }
  } catch (error) {
    print.error('Error loading from localStorage:', error)
  }
  return null
}

export async function copyProjectToClipboard(files: Record<string, string>) {
  try {
    const fileList = Object.entries(files)
      .map(([path, content]) => {
        return `// ${path}\n${content}\n\n${'='.repeat(80)}\n`
      })
      .join('\n')

    await navigator.clipboard.writeText(fileList)
    print.log('Project copied to clipboard')
    return true
  } catch (error) {
    print.error('Error copying to clipboard:', error)
    return false
  }
}
