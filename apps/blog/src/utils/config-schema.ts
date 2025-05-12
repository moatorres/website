/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { resolve } from 'path'

import * as z from '@zod/mini'

const SiteConfig = z.object({
  author: z.string().check(z.minLength(2)),
  baseUrl: z.url(),
  description: z.string().check(z.minLength(3)),
  title: z.string().check(z.minLength(2)),
})

const SocialConfig = z.object({
  discordUrl: z.url(),
  facebookUrl: z.url(),
  githubUrl: z.url(),
  instagramUrl: z.url(),
  linkedinUrl: z.url(),
  orcidUrl: z.url(),
  twitterUrl: z.url(),
})

const BaseEncoded = z.intersection(
  z.partial(SiteConfig),
  z.partial(SocialConfig)
)

const SectionsEncoded = z.partial(
  z.object({
    sections: z.string().check(z.minLength(2)),
  })
)

export const MetaConfigEncoded = z.intersection(BaseEncoded, SectionsEncoded)
export type MetaConfigEncoded = z.infer<typeof MetaConfigEncoded>

const BaseDecoded = z.intersection(SiteConfig, SocialConfig)

const SectionsDecoded = z.object({
  sections: z.array(z.object({ name: z.string().check(z.minLength(2)) })),
})

export const MetaConfigDecoded = z.intersection(BaseDecoded, SectionsDecoded)
export type MetaConfigDecoded = z.infer<typeof MetaConfigDecoded>

const BuildConfig = z.object({
  configFile: z.string().check(z.minLength(3)),
  contentDirectory: z.string().check(z.minLength(3)),
  contentRoute: z.string().check(z.minLength(1)),
  metadataDirectory: z.string().check(z.minLength(3)),
  photosDirectory: z.string().check(z.minLength(3)),
  projectRoot: z.string().check(z.minLength(3)),
})
export type BuildConfig = z.infer<typeof BuildConfig>

export const ConfigEncoded = z.intersection(MetaConfigEncoded, BuildConfig)
export type ConfigEncoded = z.infer<typeof ConfigEncoded>

export const ConfigDecoded = z.intersection(MetaConfigDecoded, BuildConfig)
export type ConfigDecoded = z.infer<typeof ConfigDecoded>

export type Config = z.infer<typeof ConfigDecoded>

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
