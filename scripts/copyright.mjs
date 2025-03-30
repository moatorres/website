/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const TEMPLATE = `/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */`

const files = execSync('git ls-files').toString().split('\n')

const extensions = ['.js', '.jsx', '.mjs', '.ts', '.tsx']

files.forEach((file) => {
  if (!extensions.includes(path.extname(file))) return

  const content = fs.readFileSync(file, 'utf-8')
  const lines = content.split('\n')
  const copyrightLineIndex = lines.findIndex((line) => line.includes('Copyright (c)'))

  if (copyrightLineIndex !== -1) {
    const currentCopyright = lines[copyrightLineIndex]
    const newCopyright = TEMPLATE.split('\n')[1]

    if (currentCopyright !== newCopyright) {
      lines[copyrightLineIndex] = newCopyright
      fs.writeFileSync(file, lines.join('\n'))
      console.log(`Updated copyright in ${path.basename(file)}`)
    }
  } else {
    fs.writeFileSync(file, `${TEMPLATE}\n\n${content}`)
    console.log(`Added copyright to ${path.basename(file)}`)
  }
})
