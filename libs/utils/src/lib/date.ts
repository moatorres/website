/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

export type FormatDistanceOptions = {
  addSuffix?: boolean
  roundingMethod?: 'floor' | 'ceil' | 'round'
}

export function formatDistanceToNow(
  date: Date | number,
  options: FormatDistanceOptions = {}
): string {
  const { addSuffix = true, roundingMethod = 'round' } = options

  const now = new Date()
  const target = new Date(date)
  const diffMs = target.getTime() - now.getTime()
  const isFuture = diffMs > 0

  const diffSeconds = diffMs / 1000
  const absSeconds = Math.abs(diffSeconds)

  const units = [
    { name: 'year', seconds: 60 * 60 * 24 * 365 },
    { name: 'month', seconds: 60 * 60 * 24 * 30 },
    { name: 'day', seconds: 60 * 60 * 24 },
    { name: 'hour', seconds: 60 * 60 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 },
  ]

  for (const unit of units) {
    const valueRaw = absSeconds / unit.seconds
    const value = Math[valueRaw < 1 ? 'round' : roundingMethod](valueRaw)

    if (value >= 1) {
      const plural = value === 1 ? '' : 's'
      const result = `${value} ${unit.name}${plural}`

      if (!addSuffix) return result
      return isFuture ? `in ${result}` : `${result} ago`
    }
  }

  return 'just now'
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
