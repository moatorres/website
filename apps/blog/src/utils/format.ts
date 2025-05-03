/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

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

export function initials(input: string, count = 2, separator = ''): string {
  const words = input.trim().split(/\s+/)
  const parts = words.slice(0, count).filter(Boolean)
  const initials = parts.map((word) => word.charAt(0).toUpperCase())
  return initials.join(separator)
}

export function prune<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined && value !== '' && value !== null
    )
  ) as Partial<T>
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
