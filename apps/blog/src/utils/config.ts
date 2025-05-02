/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { resolve } from 'path'

import dotenv from 'dotenv'
import { argv } from 'process'

dotenv.config({
  path: resolve(process.cwd(), getSourceRoot()),
})

// public
const AUTHOR_NAME = process.env.NEXT_PUBLIC_AUTHOR_NAME
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL
const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL
const LINKEDIN_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL
const ORCID_URL = process.env.NEXT_PUBLIC_ORCID_URL
const TWITTER_URL = process.env.NEXT_PUBLIC_TWITTER_URL

// template
const APP_CONTENT_ROUTE = process.env.APP_CONTENT_ROUTE
const APP_CONTENT_DIRECTORY = process.env.APP_CONTENT_DIRECTORY
const APP_DESCRIPTION = process.env.APP_DESCRIPTION
const APP_METADATA_DIRECTORY = process.env.APP_METADATA_DIRECTORY
const APP_SECTIONS = process.env.APP_SECTIONS
const APP_TITLE = process.env.APP_TITLE

const DEFAULT_CONFIG = {
  author: 'John Doe',
  baseUrl: 'http://localhost:3000',
  contentDirectory: absolute('src/content'),
  contentRoute: 'blog',
  description: "John Doe's Personal Blog",
  discordUrl: 'https://discord.com/',
  facebookUrl: 'https://facebook.com/',
  githubUrl: 'https://github.com/',
  instagramUrl: 'https://instagram.com/',
  linkedinUrl: 'https://linkedin.com/in/',
  metadataDirectory: absolute('src/data'),
  orcidUrl: 'https://orcid.org/',
  sections: [{ name: 'blog' }],
  title: 'John Doe',
  twitterUrl: 'https://twitter.com/',
}

type Config = typeof DEFAULT_CONFIG

export const config: Config = withDefaults(DEFAULT_CONFIG, {
  author: AUTHOR_NAME,
  baseUrl: BASE_URL,
  contentDirectory: absolute(APP_CONTENT_DIRECTORY),
  contentRoute: APP_CONTENT_ROUTE,
  description: APP_DESCRIPTION,
  discordUrl: DISCORD_URL,
  facebookUrl: FACEBOOK_URL,
  githubUrl: GITHUB_URL,
  instagramUrl: INSTAGRAM_URL,
  linkedinUrl: LINKEDIN_URL,
  metadataDirectory: absolute(APP_METADATA_DIRECTORY),
  orcidUrl: ORCID_URL,
  sections: sections(APP_SECTIONS),
  title: APP_TITLE,
  twitterUrl: TWITTER_URL,
})

function absolute(path?: string): string {
  if (!path) return undefined as unknown as string
  return resolve(process.cwd(), path) as string
}

function sections(sections?: string) {
  if (!sections) return
  return sections
    .split(',')
    .filter(Boolean)
    .map((name) => ({ name: name.trim() }))
}

function withDefaults<T extends object, D extends Partial<T>>(
  defaults: D,
  obj: T
): T & D {
  const filteredObj = Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>

  return {
    ...defaults,
    ...filteredObj,
  } as T & D
}

function getSourceRoot() {
  if (argv.length < 3) {
    console.error('❌ Source root not provided')
    process.exit(1)
  }
  if (!/^[a-zA-Z0-9/_-]+$/.test(argv[2])) {
    console.error('❌ Source root can only contain letters, numbers, /, _, -')
    process.exit(1)
  }
  return `${argv[2]}/.env`
}
