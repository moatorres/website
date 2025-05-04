/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { memoize } from './memoize.js'

describe('memoize.ts', () => {
  it('returns the correct result from the original function', () => {
    const add = (a: number, b: number) => a + b
    const memoizedAdd = memoize(add)

    expect(memoizedAdd(2, 3)).toBe(5)
    expect(memoizedAdd(1, 4)).toBe(5)
  })

  it('calls the original function only once for the same arguments', () => {
    const fn = jest.fn((x: number) => x * 2)
    const memoizedFn = memoize(fn)

    expect(memoizedFn(10)).toBe(20)
    expect(memoizedFn(10)).toBe(20)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('caches results separately for different arguments', () => {
    const fn = jest.fn((x: number) => x + 1)
    const memoizedFn = memoize(fn)

    expect(memoizedFn(1)).toBe(2)
    expect(memoizedFn(2)).toBe(3)
    expect(memoizedFn(1)).toBe(2)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('works with functions that take no arguments', () => {
    const fn = jest.fn(() => 42)
    const memoizedFn = memoize(fn)

    expect(memoizedFn()).toBe(42)
    expect(memoizedFn()).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses JSON.stringify to cache complex arguments correctly', () => {
    const fn = jest.fn((obj: { a: number }) => obj.a)
    const memoizedFn = memoize(fn)

    const arg = { a: 10 }

    expect(memoizedFn(arg)).toBe(10)
    expect(memoizedFn({ a: 10 })).toBe(10)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
