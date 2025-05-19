import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const TEMPLATE = `/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */`

const ignoreDirectories = [':!libs/ui/**']
const allowedExtensions = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx'])
const excludedFiles = new Set(['next-env.d.ts'])

function main() {
  console.log('🚀 Copyright Script')

  const files = execSync(`git ls-files ${ignoreDirectories.join(' ')}`, {
    encoding: 'utf-8',
  }).split('\n')

  files.forEach((file) => {
    if (excludedFiles.has(path.basename(file))) return
    if (!allowedExtensions.has(path.extname(file))) return

    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    const copyrightLineIndex = lines.findIndex((line) =>
      line.includes('Copyright (c)')
    )

    if (copyrightLineIndex !== -1) {
      const currentCopyright = lines[copyrightLineIndex]
      const newCopyright = TEMPLATE.split('\n')[1]

      if (currentCopyright !== newCopyright) {
        lines[copyrightLineIndex] = newCopyright
        console.log(`⚡️ Updating copyright in: ${path.basename(file)}`)
        fs.writeFileSync(file, lines.join('\n'))
      }
    } else {
      console.log(`⚡️ Adding copyright to: ${path.basename(file)}`)
      fs.writeFileSync(file, `${TEMPLATE}\n\n${content}`)
    }
  })

  console.log('✅ Done')
}

main()
