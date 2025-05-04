/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

export function green(...str: unknown[]): string {
  return `\x1b[1;32m${str.join(' ')}\x1b[0m`
}

export function blue(...str: unknown[]): string {
  return `\x1b[1;34m${str.join(' ')}\x1b[0m`
}

export function cyan(...str: unknown[]): string {
  return `\x1b[1;36m${str.join(' ')}\x1b[0m`
}

export function magenta(...str: unknown[]): string {
  return `\x1b[1;35m${str.join(' ')}\x1b[0m`
}

export function gray(...str: unknown[]): string {
  return `\x1b[1;30m${str.join(' ')}\x1b[0m`
}

export function white(...str: unknown[]): string {
  return `\x1b[1;37m${str.join(' ')}\x1b[0m`
}

export function black(...str: unknown[]): string {
  return `\x1b[1;30m${str.join(' ')}\x1b[0m`
}

export function yellow(...str: unknown[]): string {
  return `\x1b[1;33m${str.join(' ')}\x1b[0m`
}

export function dim(...str: unknown[]): string {
  return `\x1b[2m${str.join(' ')}\x1b[0m`
}

export function red(...str: unknown[]): string {
  return `\x1b[1;31m${str.join(' ')}\x1b[0m`
}

export function purple(...str: unknown[]): string {
  return `\x1b[1;35m${str.join(' ')}\x1b[0m`
}

export function underline(...str: unknown[]): string {
  return `\x1b[4m${str.join(' ')}\x1b[0m`
}

export function inverse(...str: unknown[]): string {
  return `\x1b[7m${str.join(' ')}\x1b[0m`
}

export function strikethrough(...str: unknown[]): string {
  return `\x1b[9m${str.join(' ')}\x1b[0m`
}

export function italic(...str: unknown[]): string {
  return `\x1b[3m${str.join(' ')}\x1b[0m`
}

export function reset(...str: unknown[]): string {
  return `\x1b[0m${str.join(' ')}\x1b[0m`
}

export function bold(...str: unknown[]): string {
  return `\x1b[1m${str.join(' ')}\x1b[0m`
}
