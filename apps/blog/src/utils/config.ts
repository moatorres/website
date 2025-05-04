/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { existsSync } from 'fs'
import { resolve } from 'path'

import * as z from '@zod/mini'
import dotenv from 'dotenv'

import { blue, dim, yellow } from './ansi'
import * as print from './print'

z.config(z.locales.en())

const BaseConfig = z.object({
  author: z.string().check(z.minLength(2)),
  baseUrl: z.url(),
  configFile: z.string().check(z.minLength(3)),
  contentDirectory: z.string().check(z.minLength(3)),
  contentRoute: z.string().check(z.minLength(1)),
  description: z.string().check(z.minLength(3)),
  discordUrl: z.url(),
  facebookUrl: z.url(),
  githubUrl: z.url(),
  instagramUrl: z.url(),
  linkedinUrl: z.url(),
  metadataDirectory: z.string().check(z.minLength(3)),
  photosDirectory: z.string().check(z.minLength(3)),
  projectRoot: z.string().check(z.minLength(3)),
  orcidUrl: z.url(),
  title: z.string().check(z.minLength(2)),
  twitterUrl: z.url(),
})

const SectionsDecoded = z.object({
  sections: z.array(z.object({ name: z.string().check(z.minLength(2)) })),
})

const SectionsEncoded = z.object({
  sections: z.string().check(z.minLength(2)),
})

export const ConfigEncoded = z.intersection(BaseConfig, SectionsEncoded)
export type ConfigEncoded = z.infer<typeof ConfigEncoded>

export const ConfigDecoded = z.intersection(BaseConfig, SectionsDecoded)
export type ConfigDecoded = z.infer<typeof ConfigDecoded>

export type Config = z.infer<typeof ConfigDecoded>

export type ConfigMap = {
  [Key in keyof Config]: {
    variable: string
    fallback: string
    transform?: Transform
  }
}

export const ConfigMap: ConfigMap = {
  author: {
    variable: 'NEXT_PUBLIC_AUTHOR_NAME',
    fallback: 'John Doe',
  },
  baseUrl: {
    variable: 'NEXT_PUBLIC_BASE_URL',
    fallback: 'https://example.com',
  },
  configFile: {
    variable: 'APP_CONFIG_FILE',
    fallback: 'info.json',
  },
  contentDirectory: {
    variable: 'APP_CONTENT_DIRECTORY',
    fallback: 'src/content',
    transform: 'absolute',
  },
  contentRoute: {
    variable: 'APP_CONTENT_ROUTE',
    fallback: 'blog',
  },
  description: {
    variable: 'APP_DESCRIPTION',
    fallback: "John Doe's Personal Blog",
  },
  discordUrl: {
    variable: 'NEXT_PUBLIC_DISCORD_URL',
    fallback: 'https://discord.com/',
  },
  facebookUrl: {
    variable: 'NEXT_PUBLIC_FACEBOOK_URL',
    fallback: 'https://facebook.com/',
  },
  githubUrl: {
    variable: 'NEXT_PUBLIC_GITHUB_URL',
    fallback: 'https://github.com/',
  },
  instagramUrl: {
    variable: 'NEXT_PUBLIC_INSTAGRAM_URL',
    fallback: 'https://instagram.com/',
  },
  linkedinUrl: {
    variable: 'NEXT_PUBLIC_LINKEDIN_URL',
    fallback: 'https://linkedin.com/in/',
  },
  metadataDirectory: {
    variable: 'APP_METADATA_DIRECTORY',
    fallback: 'src/data',
    transform: 'absolute',
  },
  orcidUrl: {
    variable: 'NEXT_PUBLIC_ORCID_URL',
    fallback: 'https://orcid.org/',
  },
  photosDirectory: {
    variable: 'APP_PHOTOS_DIRECTORY',
    fallback: 'images/photos',
    transform: 'absolute',
  },
  projectRoot: {
    variable: 'APP_PROJECT_ROOT',
    fallback: 'apps/blog',
  },
  sections: {
    variable: 'APP_SECTIONS',
    fallback: 'blog',
    transform: 'sections',
  },
  title: {
    variable: 'APP_TITLE',
    fallback: 'John Doe',
  },
  twitterUrl: {
    variable: 'NEXT_PUBLIC_TWITTER_URL',
    fallback: 'https://twitter.com/',
  },
}

export type Transform = 'sections' | 'absolute'

export type TransformFn = (input: unknown) => unknown

export const transforms: Record<Transform, TransformFn> = {
  absolute(relative?: unknown) {
    if (typeof relative !== 'string') return
    return resolve(process.cwd(), relative.trim())
  },
  sections(sections?: unknown) {
    if (typeof sections !== 'string') return
    return sections
      .split(',')
      .filter(Boolean)
      .map((name) => ({ name: name.trim() }))
  },
}

export function isNonEmpty(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim() !== ''
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return true
  }
  if (Array.isArray(value)) {
    return value.length > 0 && value.some(isNonEmpty)
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
    return entries.length > 0 && entries.some(([_, v]) => isNonEmpty(v))
  }
  return false
}

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
  relativePath = process.env[ConfigMap.configFile.variable] ?? 'info.json'
) {
  const absolutePath = resolve(process.cwd(), relativePath)

  try {
    const jsonConfig = require(absolutePath) as ConfigEncoded
    print.info(
      `Loaded ${blue(absolutePath.split('/')?.pop())} ${dim(absolutePath)}`
    )
    return jsonConfig
  } catch {
    print.warn(`Could not parse ${yellow(absolutePath)}, skipping.`)
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
  const arg = process.argv[2]

  const relativePath = arg?.includes('.env') ? arg : `${arg}/.env`
  const absolutePath = resolve(process.cwd(), relativePath)

  if (process.argv.length < 3 || !existsSync(absolutePath)) {
    print.warn(`Could not load ${yellow(absolutePath)}, using defaults.`)
  } else {
    dotenv.config({ path: absolutePath })
    print.info(`Loaded ${blue('.env')} ${dim(absolutePath)}`)
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
