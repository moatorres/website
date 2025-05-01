/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { resolve } from 'path'

// public
const AUTHOR_DISCORD_URL = process.env.NEXT_PUBLIC_AUTHOR_DISCORD_URL
const AUTHOR_FACEBOOK_URL = process.env.NEXT_PUBLIC_AUTHOR_FACEBOOK_URL
const AUTHOR_GITHUB_URL = process.env.NEXT_PUBLIC_AUTHOR_GITHUB_URL
const AUTHOR_INSTAGRAM_URL = process.env.NEXT_PUBLIC_AUTHOR_INSTAGRAM_URL
const AUTHOR_LINKEDIN_URL = process.env.NEXT_PUBLIC_AUTHOR_LINKEDIN_URL
const AUTHOR_NAME = process.env.NEXT_PUBLIC_AUTHOR_NAME
const AUTHOR_ORCID_URL = process.env.NEXT_PUBLIC_ORCID_URL
const AUTHOR_TWITTER_URL = process.env.NEXT_PUBLIC_TWITTER_URL
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// template
const APP_CONTENT_ROUTE = process.env.TEMPLATE_APP_CONTENT_ROUTE
const APP_CONTENT_DIRECTORY = process.env.TEMPLATE_APP_CONTENT_DIRECTORY
const APP_DESCRIPTION = process.env.TEMPLATE_APP_DESCRIPTION
const APP_METADATA_DIRECTORY = process.env.TEMPLATE_APP_METADATA_DIRECTORY
const APP_SECTIONS = process.env.TEMPLATE_APP_SECTIONS
const APP_TITLE = process.env.TEMPLATE_APP_TITLE

const DEFAULT_CONFIG = {
  authorDiscordUrl: 'https://discord.com/',
  authorFacebookUrl: 'https://facebook.com/',
  authorGithubUrl: 'https://github.com/',
  authorInstagramUrl: 'https://instagram.com/',
  authorLinkedinUrl: 'https://linkedin.com/in/',
  authorName: 'John Doe',
  authorOrcidUrl: 'https://orcid.org/',
  authorTwitterUrl: 'https://twitter.com/',
  baseUrl: 'http://localhost:3000',
  contentDirectory: absolute('src/content'),
  contentRoute: 'blog',
  description: "John Doe's Personal Blog",
  metadataDirectory: absolute('src/data'),
  sections: [{ name: 'blog' }],
  title: 'John Doe',
}

export const config = withDefaults(DEFAULT_CONFIG, {
  authorDiscordUrl: AUTHOR_DISCORD_URL,
  authorFacebookUrl: AUTHOR_FACEBOOK_URL,
  authorGithubUrl: AUTHOR_GITHUB_URL,
  authorInstagramUrl: AUTHOR_INSTAGRAM_URL,
  authorLinkedinUrl: AUTHOR_LINKEDIN_URL,
  authorName: AUTHOR_NAME,
  authorOrcidUrl: AUTHOR_ORCID_URL,
  authorTwitterUrl: AUTHOR_TWITTER_URL,
  baseUrl: BASE_URL,
  contentDirectory: absolute(APP_CONTENT_DIRECTORY),
  contentRoute: APP_CONTENT_ROUTE,
  description: APP_DESCRIPTION,
  metadataDirectory: absolute(APP_METADATA_DIRECTORY),
  sections: sections(APP_SECTIONS),
  title: APP_TITLE,
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
  return {
    ...defaults,
    ...obj,
  }
}
