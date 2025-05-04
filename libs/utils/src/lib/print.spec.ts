/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import * as ansi from './ansi.js'
import * as logger from './print.js' // Adjust the path as needed

describe('print.ts', () => {
  const consoleSpies = {
    log: jest.spyOn(console, 'log').mockImplementation(() => void 0),
    info: jest.spyOn(console, 'info').mockImplementation(() => void 0),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => void 0),
    error: jest.spyOn(console, 'error').mockImplementation(() => void 0),
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('warn logs with yellow "WARNING:" prefix', () => {
    const msg = 'This is a warning'
    const expectedPrefix = ansi.yellow('WARNING:')

    logger.warn(msg)

    expect(consoleSpies.warn).toHaveBeenCalledWith(expectedPrefix, msg)
  })

  it('error logs with red "ERROR:" prefix', () => {
    const msg = 'This is an error'
    const expectedPrefix = ansi.red('ERROR:')

    logger.error(msg)

    expect(consoleSpies.error).toHaveBeenCalledWith(expectedPrefix, msg)
  })

  it('info logs with blue "INFO:" prefix', () => {
    const msg = 'This is an info message'
    const expectedPrefix = ansi.blue('INFO:')

    logger.info(msg)

    expect(consoleSpies.info).toHaveBeenCalledWith(expectedPrefix, msg)
  })

  it('success logs with green "SUCCESS:" prefix', () => {
    const msg = 'Operation successful'
    const expectedPrefix = ansi.green('SUCCESS:')

    logger.success(msg)

    expect(consoleSpies.log).toHaveBeenCalledWith(expectedPrefix, msg)
  })

  it('log logs with dim "LOG:" prefix', () => {
    const msg = 'Basic log'
    const expectedPrefix = ansi.dim('LOG:')

    logger.log(msg)

    expect(consoleSpies.log).toHaveBeenCalledWith(expectedPrefix, msg)
  })

  it('debug logs with purple "DEBUG:" prefix', () => {
    const msg = 'Debugging...'
    const expectedPrefix = ansi.purple('DEBUG:')

    logger.debug(msg)

    expect(consoleSpies.log).toHaveBeenCalledWith(expectedPrefix, msg)
  })

  it('trace logs with gray "TRACE:" prefix', () => {
    const msg = 'Trace info'
    const expectedPrefix = ansi.gray('TRACE:')

    logger.trace(msg)

    expect(consoleSpies.log).toHaveBeenCalledWith(expectedPrefix, msg)
  })

  it('forwards multiple arguments correctly', () => {
    const args = ['Multiple', 'args', 123, { test: true }]
    logger.debug(...args)

    expect(consoleSpies.log).toHaveBeenCalledWith(
      ansi.purple('DEBUG:'),
      ...args
    )
  })
})
