/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import * as ansi from './ansi.js'

describe('ansi.ts', () => {
  describe('ANSI style functions', () => {
    const styles: [keyof typeof ansi, string][] = [
      ['green', '\x1b[1;32m'],
      ['blue', '\x1b[1;34m'],
      ['cyan', '\x1b[1;36m'],
      ['magenta', '\x1b[1;35m'],
      ['gray', '\x1b[1;30m'],
      ['white', '\x1b[1;37m'],
      ['black', '\x1b[1;30m'],
      ['yellow', '\x1b[1;33m'],
      ['dim', '\x1b[2m'],
      ['red', '\x1b[1;31m'],
      ['purple', '\x1b[1;35m'],
      ['underline', '\x1b[4m'],
      ['inverse', '\x1b[7m'],
      ['strikethrough', '\x1b[9m'],
      ['italic', '\x1b[3m'],
      ['reset', '\x1b[0m'],
      ['bold', '\x1b[1m'],
    ]

    test.each(styles)('%s returns a function', (fnName) => {
      const fn = ansi[fnName]
      expect(typeof fn).toBe('function')
    })

    test.each(styles)(
      '%s formats string with correct ANSI code',
      (fnName, ansiCode) => {
        const fn = ansi[fnName]
        const result = fn('Hello', 'World')

        expect(typeof result).toBe('string')
        expect(result.startsWith(ansiCode)).toBe(true)
        expect(result.endsWith('\x1b[0m')).toBe(true)
        expect(result.includes('Hello World')).toBe(true)
      }
    )
  })
})
