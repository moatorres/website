import { saveAs } from 'file-saver'
import JSZip from 'jszip'

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

  console.log(
    `[v0] Filtered ${Object.keys(files).length} files to ${Object.keys(sourceFiles).length} source files`
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
    console.log(
      `[v0] Project saved to localStorage: ${key} (${Object.keys(sourceFiles).length} source files)`
    )
    return true
  } catch (error) {
    console.error('[v0] Error saving to localStorage:', error)
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
      console.log(`[v0] Project loaded from localStorage: ${key}`)
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('[v0] Error loading from localStorage:', error)
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
    console.log('[v0] Project copied to clipboard')
    return true
  } catch (error) {
    console.error('[v0] Error copying to clipboard:', error)
    return false
  }
}
