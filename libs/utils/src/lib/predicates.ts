/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

export function isNonEmpty(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim() !== ''
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return true
  }
  if (Array.isArray(value)) {
    return value.length > 0 && value.some(isNonEmpty)
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return entries.length > 0 && entries.some(([_, v]) => isNonEmpty(v))
  }
  return false
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return false
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isEmpty)
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return entries.length === 0 || entries.every(([_, v]) => isEmpty(v))
  }

  return true
}
