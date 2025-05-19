/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import { extname, join } from 'path'

/**
 * Renames all files in a directory using a random UUID, preserving the file extension.
 * @param dirPath The path to the directory containing files to rename.
 */
export async function renameFiles(
  dirPath: string,
  randomString?: (...args: any[]) => string
): Promise<void> {
  const namingFunction = randomString ?? randomUUID

  try {
    const files = await fs.readdir(dirPath)

    for (const file of files) {
      const originalPath = join(dirPath, file)
      const stat = await fs.stat(originalPath)

      if (stat.isFile()) {
        const extension = extname(file)
        const newFileName = `${namingFunction()}${extension}`
        const newPath = join(dirPath, newFileName)

        await fs.rename(originalPath, newPath)
        console.log(`Renamed: ${file} -> ${newFileName}`)
      }
    }
  } catch (err) {
    console.error(`Error renaming files:`, err)
  }
}
