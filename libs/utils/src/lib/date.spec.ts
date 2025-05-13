/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { formatDate, formatDistanceToNow } from './date.js'

describe('format.ts', () => {
  describe('formatDate', () => {
    it('should format a date string to "Month Day, Year"', () => {
      expect(formatDate('2023-01-01')).toBe('January 1, 2023')
    })
  })

  describe('formatDistanceToNow', () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-01').getTime())
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('should format a date string to "X time ago"', () => {
      expect(formatDistanceToNow(new Date('2023-01-01'))).toBe('2 years ago')
    })

    it('should format a date string to "in X time"', () => {
      expect(formatDistanceToNow(new Date('2027-01-01'))).toBe('in 2 years')
    })

    it('should format a date string to "X time ago" with addSuffix false', () => {
      expect(
        formatDistanceToNow(new Date('2023-01-01'), { addSuffix: false })
      ).toBe('2 years')
    })

    it('should format a date string to "X time" with addSuffix false', () => {
      expect(
        formatDistanceToNow(new Date('2027-01-01'), { addSuffix: false })
      ).toBe('2 years')
    })

    it('should format a date string to "X time ago" with roundingMethod floor', () => {
      expect(
        formatDistanceToNow(new Date('2024-01-01'), { roundingMethod: 'floor' })
      ).toBe('1 year ago')
    })

    it('should format a date string to "in X time" with roundingMethod floor', () => {
      expect(
        formatDistanceToNow(new Date('2026-01-01'), { roundingMethod: 'floor' })
      ).toBe('in 1 year')
    })

    it('should format a date string to "X time ago" with roundingMethod ceil', () => {
      expect(
        formatDistanceToNow(new Date('2024-12-01'), { roundingMethod: 'ceil' })
      ).toBe('2 months ago')
    })

    it('should format a date string to "in X time" with roundingMethod ceil', () => {
      expect(
        formatDistanceToNow(new Date('2025-02-01'), { roundingMethod: 'ceil' })
      ).toBe('in 2 months')
    })

    it('should format a date string to "X time ago" with roundingMethod round', () => {
      expect(
        formatDistanceToNow(new Date('2023-01-01'), { roundingMethod: 'round' })
      ).toBe('2 years ago')
    })

    it('should format a date string to "in X time" with roundingMethod round', () => {
      expect(
        formatDistanceToNow(new Date('2027-01-01'), { roundingMethod: 'round' })
      ).toBe('in 2 years')
    })

    it('should format a date string to "just now"', () => {
      expect(formatDistanceToNow(new Date())).toBe('just now')
    })

    it('should format a date string to "just now" with addSuffix false', () => {
      expect(formatDistanceToNow(new Date(), { addSuffix: false })).toBe(
        'just now'
      )
    })

    it('should format a date string to "just now" with roundingMethod floor', () => {
      expect(formatDistanceToNow(new Date(), { roundingMethod: 'floor' })).toBe(
        'just now'
      )
    })

    it('should format a date string to "just now" with roundingMethod ceil', () => {
      expect(formatDistanceToNow(new Date(), { roundingMethod: 'ceil' })).toBe(
        'just now'
      )
    })

    it('should format a date string to "just now" with roundingMethod round', () => {
      expect(formatDistanceToNow(new Date(), { roundingMethod: 'round' })).toBe(
        'just now'
      )
    })
  })
})
