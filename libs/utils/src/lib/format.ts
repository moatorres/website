import { resolve } from 'path'

export function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export function initials(
  input: string,
  count = 2,
  separator: '' | '.' = ''
): string {
  const words = input.trim().split(/\s+/)
  const parts = words.slice(0, count < 0 ? 1 : count).filter(Boolean)
  const initials = parts.map((word) => word.charAt(0).toUpperCase())
  return separator === '.' ? initials.join(separator) + '.' : initials.join('')
}

export function prune<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== '' && value !== null
    )
  ) as Partial<T>
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function relativePath(absolute: string): string {
  return absolute.split(process.cwd()).pop() ?? absolute
}

export function absolutePath(relative: string): string {
  return resolve(process.cwd(), relative)
}

export function lastSegment(path: string): string {
  return path.split('/').pop() ?? ''
}
