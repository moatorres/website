/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { existsSync } from 'fs'

import {
  absolutePath,
  blue,
  dim,
  isNonEmpty,
  lastSegment,
  print,
  yellow,
} from '@blog/utils'
import * as z from '@zod/mini'
import dotenv from 'dotenv'

import {
  Config,
  ConfigDecoded,
  ConfigEncoded,
  ConfigMap,
  Transform,
  TransformFn,
  transforms,
} from './config-schema'

export function getDefaultConfig(): Partial<ConfigDecoded> {
  return Object.entries(ConfigMap).reduce<Partial<ConfigDecoded>>(
    (result, [key, { fallback, transform }]) => {
      const fn = transforms[transform as Transform] as TransformFn
      const value = transform ? fn(fallback) : fallback
      return Object.assign(result, { [key]: value })
    },
    {}
  )
}

export function resolveConfig(
  map: ConfigMap,
  config: Partial<ConfigEncoded>
): ConfigDecoded {
  const result = {} as Config

  for (const key in map) {
    const entry = map[key as keyof ConfigMap]

    if (!entry) continue

    const { variable, fallback, transform } = entry

    const valueFromEnvironment = process.env[variable]
    const valueFromConfiguration = config[key as keyof ConfigEncoded]

    const resolvedValue = isNonEmpty(valueFromEnvironment)
      ? valueFromEnvironment
      : isNonEmpty(valueFromConfiguration)
        ? valueFromConfiguration
        : fallback

    const transformFunction = transform ? transforms[transform] : undefined

    const value = transformFunction
      ? transformFunction(resolvedValue)
      : resolvedValue

    Object.assign(result, { [key]: value })
  }
  return result
}

export function transformConfig(
  ...sources: Partial<ConfigEncoded>[]
): ConfigDecoded {
  const result = {} as ConfigDecoded

  for (const key in ConfigMap) {
    const { variable, fallback, transform } = ConfigMap[key as keyof Config]
    const valueFromEnvironment = process.env[variable]

    let valueFromSource: unknown = undefined

    for (const source of sources) {
      const currentValue = source?.[key as keyof ConfigEncoded]
      if (isNonEmpty(currentValue)) {
        valueFromSource = currentValue
      }
    }

    const resolvedValue = isNonEmpty(valueFromEnvironment)
      ? valueFromEnvironment
      : isNonEmpty(valueFromSource)
        ? valueFromSource
        : fallback

    const fn = transform ? transforms[transform] : undefined
    const value = fn ? fn(resolvedValue) : resolvedValue

    Object.assign(result, { [key]: value })
  }

  return result
}

export function getJsonConfig(
  configFile = process.env[ConfigMap.configFile.variable] ?? 'info.json'
) {
  const jsonFilePath = absolutePath(configFile)

  try {
    const jsonConfig = require(jsonFilePath) as ConfigEncoded
    print.info(`Loaded ${blue(lastSegment(configFile))} ${dim(jsonFilePath)}`)
    return jsonConfig
  } catch {
    print.warn(`Could not parse ${yellow(jsonFilePath)}, skipping.`)
    return {} as ConfigEncoded
  }
}

export function getEnvConfig() {
  const envConfig = Object.entries(ConfigMap).reduce<Partial<ConfigEncoded>>(
    (result, [key, { variable }]) => {
      const value = process.env[variable]
      if (value) {
        return { ...result, [key]: value }
      }
      return result
    },
    {}
  )

  if (process.env.DEBUG_CONFIG === 'true') {
    console.dir({ envConfig }, { depth: null })
  }

  return envConfig
}

export function getConfig(): ConfigDecoded {
  const envFileFromArg = process.argv[2]?.includes('.env')
    ? process.argv[2]
    : `${process.argv[2]}/.env`

  const envFilePath = absolutePath(envFileFromArg)

  if (process.argv.length < 3 || !existsSync(envFilePath)) {
    print.warn(`Could not find ${yellow(envFilePath)}, skipping.`)
  } else {
    dotenv.config({ path: envFilePath })
    print.info(`Loaded ${blue('.env')} ${dim(envFilePath)}`)
  }

  const jsonConfig = getJsonConfig()
  const resolvedConfig = resolveConfig(ConfigMap, jsonConfig)

  if (process.env.DEBUG_CONFIG === 'true') {
    console.dir({ jsonConfig }, { depth: null })
  }

  const parsed = ConfigDecoded.safeParse(resolvedConfig)

  if (!parsed.success) {
    print.error(z.prettifyError(parsed.error))
    process.exit(1)
  }

  if (process.env.DEBUG_CONFIG === 'true') {
    console.dir({ resolvedConfig: parsed.data }, { depth: null })
  }

  return parsed.data
}
