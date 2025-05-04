import { blue, dim, gray, green, purple, red, yellow } from './ansi.js'

export function warn(...args: unknown[]): void {
  console.warn(yellow('WARNING:'), ...args)
}

export function error(...args: unknown[]): void {
  console.error(red('ERROR:'), ...args)
}

export function info(...args: unknown[]): void {
  console.info(blue('INFO:'), ...args)
}
export function success(...args: unknown[]): void {
  console.log(green('SUCCESS:'), ...args)
}

export function log(...args: unknown[]): void {
  console.log(dim('LOG:'), ...args)
}

export function debug(...args: unknown[]): void {
  console.log(purple('DEBUG:'), ...args)
}

export function trace(...args: unknown[]): void {
  console.log(gray('TRACE:'), ...args)
}
