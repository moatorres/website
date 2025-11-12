import { useCallback, useEffect, useRef } from 'react'

/**
 * Custom hook to debounce a function call.
 * @param callback The function to debounce.
 * @param delay The delay in milliseconds.
 * @returns A debounced version of the callback function.
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  // Update callbackRef whenever the callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // The debounced function
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  ) as T

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}
