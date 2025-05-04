import { dim, yellow } from './ansi.js'
import * as print from './print.js'

export function isNonEmptyWithLog(
  value: unknown,
  path = 'value',
  report = false
): boolean {
  if (typeof value === 'string') {
    const valid = value.trim() !== ''

    if (!valid && report) {
      print.warn(`Empty string ${yellow(path)}`)
    }

    return valid
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return true
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      if (report) {
        print.warn(`Empty array "${yellow(path)}"`)
      }
      return false
    }

    const someValid = value.some((item, i) =>
      isNonEmptyWithLog(item, `${path}[${i}]`)
    )

    if (!someValid && report) {
      print.warn(`Empty array elements ${yellow(path)}`)
    }

    return someValid
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0) {
      if (report) {
        print.warn(`Empty object ${yellow(path)}`)
      }
      return false
    }

    const someValid = entries.some(([k, v]) =>
      isNonEmptyWithLog(v, `${path}.${k}`)
    )
    if (!someValid) {
      if (report) {
        print.warn(`Object properties empty ${yellow(path)}`)
      }
    }
    return someValid
  }

  if (report) {
    print.warn(`Invalid type ${yellow(path)} ${dim(typeof value)}`)
  }

  return false
}
