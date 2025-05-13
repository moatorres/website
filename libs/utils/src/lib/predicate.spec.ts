/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { isEmpty, isNonEmpty } from './predicates.js'

describe('predicate.ts', () => {
  describe('isEmpty', () => {
    // Null and undefined
    it('returns true for null', () => {
      expect(isEmpty(null)).toBe(true)
    })

    it('returns true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true)
    })

    // Strings
    it('returns true for empty string', () => {
      expect(isEmpty('')).toBe(true)
    })

    it('returns true for whitespace-only string', () => {
      expect(isEmpty('   ')).toBe(true)
    })

    it('returns false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false)
    })

    // Numbers
    it('returns false for 0', () => {
      expect(isEmpty(0)).toBe(false)
    })

    it('returns false for any number', () => {
      expect(isEmpty(123)).toBe(false)
      expect(isEmpty(-456)).toBe(false)
    })

    // Booleans
    it('returns false for true', () => {
      expect(isEmpty(true)).toBe(false)
    })

    it('returns false for false', () => {
      expect(isEmpty(false)).toBe(false)
    })

    // Arrays
    it('returns true for empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('returns true for array with only empty values', () => {
      expect(isEmpty(['', ' ', null, undefined])).toBe(true)
    })

    it('returns false for array with at least one non-empty value', () => {
      expect(isEmpty(['', 0])).toBe(false)
    })

    it('returns true for nested empty arrays', () => {
      expect(isEmpty([[], ['']])).toBe(true)
    })

    it('returns false for nested array with non-empty value', () => {
      expect(isEmpty([[], ['hello']])).toBe(false)
    })

    // Objects
    it('returns true for empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('returns true for object with only empty values', () => {
      expect(isEmpty({ a: '', b: null, c: [] })).toBe(true)
    })

    it('returns false for object with at least one non-empty value', () => {
      expect(isEmpty({ a: '', b: 42 })).toBe(false)
    })

    it('returns true for nested empty object', () => {
      expect(isEmpty({ a: { b: '' } })).toBe(true)
    })

    it('returns false for nested object with non-empty value', () => {
      expect(isEmpty({ a: { b: 'hello' } })).toBe(false)
    })
  })

  describe('isNonEmpty', () => {
    // Strings
    it('returns false for empty string', () => {
      expect(isNonEmpty('')).toBe(false)
    })

    it('returns false for whitespace-only string', () => {
      expect(isNonEmpty('   ')).toBe(false)
    })

    it('returns true for non-empty string', () => {
      expect(isNonEmpty('hello')).toBe(true)
    })

    // Numbers
    it('returns true for 0', () => {
      expect(isNonEmpty(0)).toBe(true)
    })

    it('returns true for any number', () => {
      expect(isNonEmpty(123)).toBe(true)
      expect(isNonEmpty(-456)).toBe(true)
    })

    // Booleans
    it('returns true for true', () => {
      expect(isNonEmpty(true)).toBe(true)
    })

    it('returns true for false', () => {
      expect(isNonEmpty(false)).toBe(true)
    })

    // Arrays
    it('returns false for empty array', () => {
      expect(isNonEmpty([])).toBe(false)
    })

    it('returns false for array of empty values', () => {
      expect(isNonEmpty(['', ' ', null, undefined])).toBe(false)
    })

    it('returns true for array with at least one non-empty value', () => {
      expect(isNonEmpty(['', 0])).toBe(true)
    })

    it('returns true for nested non-empty value', () => {
      expect(isNonEmpty([[], ['']])).toBe(false)
      expect(isNonEmpty([[], ['hello']])).toBe(true)
    })

    // Objects
    it('returns false for empty object', () => {
      expect(isNonEmpty({})).toBe(false)
    })

    it('returns false for object with only empty values', () => {
      expect(isNonEmpty({ a: '', b: null, c: [] })).toBe(false)
    })

    it('returns true for object with at least one non-empty value', () => {
      expect(isNonEmpty({ a: '', b: 42 })).toBe(true)
    })

    it('returns true for nested non-empty object', () => {
      expect(isNonEmpty({ a: { b: '' } })).toBe(false)
      expect(isNonEmpty({ a: { b: 'hello' } })).toBe(true)
    })

    // Other types
    it('returns false for null', () => {
      expect(isNonEmpty(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isNonEmpty(undefined)).toBe(false)
    })
  })
})
