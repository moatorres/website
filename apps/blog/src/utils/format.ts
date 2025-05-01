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

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function initials(input: string): string {
  const words = input.trim().split(/\s+/)
  const firstTwo = words.slice(0, 2)
  const initials = firstTwo.map((word) => word.charAt(0).toUpperCase())
  return initials.join('')
}
