/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { resolve } from 'path'

// static
const APP_SOURCE_ROOT = 'apps/blog'
const AUTHOR_EMAIL = 'hello@moatorres.com'
const AUTHOR_GITHUB_HANDLE = 'moatorres'
const AUTHOR_LINKEDIN_HANDLE = 'moatorres'
const AUTHOR_NAME = 'Moa Torres'
const AUTHOR_ORCID = '0009-0006-2281-1690'
const BASE_ROUTE_PATH = 'blog'
const CONTENT_DIR_RELATIVE_PATH = 'src/content'
const GITHUB_BASE_URL = 'https://github.com/'
const LINKEDIN_BASE_URL = 'https://www.linkedin.com/in/'
const METADATA_DIR_RELATIVE_PATH = 'src/data'
const ORCID_BASE_URL = 'https://orcid.org/'
const WEBSITE_DESCRIPTION =
  'Leading Through Complexity—At the Intersection of Culture, Science & Technology'
const WEBSITE_HEADER_TITLE = 'MT'
const WEBSITE_PREVIEW_URL = 'https://moatorres-blog.vercel.app'
const WEBSITE_PRODUCTION_URL = 'https://moatorres.com'
const WEBSITE_SECTIONS = [
  { name: 'Blog' },
  { name: 'Projects' },
  { name: 'Talks' },
]
const WEBSITE_TITLE = 'Moa Torres'

// derived
const CONTENT_DIR_ABSOLUTE_PATH = resolve(
  process.cwd(),
  APP_SOURCE_ROOT,
  CONTENT_DIR_RELATIVE_PATH
)
const METADATA_DIR_ABSOLUTE_PATH = resolve(
  process.cwd(),
  APP_SOURCE_ROOT,
  METADATA_DIR_RELATIVE_PATH
)
const AUTHOR_GITHUB_URL = GITHUB_BASE_URL + AUTHOR_GITHUB_HANDLE
const AUTHOR_LINKEDIN_URL = LINKEDIN_BASE_URL + AUTHOR_LINKEDIN_HANDLE
const AUTHOR_ORCID_URL = ORCID_BASE_URL + AUTHOR_ORCID

// external
export const config = {
  author: AUTHOR_NAME,
  baseRoute: BASE_ROUTE_PATH,
  contentDirectory: CONTENT_DIR_ABSOLUTE_PATH,
  description: WEBSITE_DESCRIPTION,
  email: AUTHOR_EMAIL,
  githubUser: AUTHOR_GITHUB_HANDLE,
  githubUrl: AUTHOR_GITHUB_URL,
  headerTitle: WEBSITE_HEADER_TITLE,
  linkedinUser: AUTHOR_LINKEDIN_HANDLE,
  linkedinUrl: AUTHOR_LINKEDIN_URL,
  metadataDirectory: METADATA_DIR_ABSOLUTE_PATH,
  orcid: AUTHOR_ORCID,
  orcidUrl: AUTHOR_ORCID_URL,
  sections: WEBSITE_SECTIONS,
  sourceRoot: APP_SOURCE_ROOT,
  title: WEBSITE_TITLE,
  url: WEBSITE_PRODUCTION_URL,
  previewUrl: WEBSITE_PREVIEW_URL,
}

export const baseUrl =
  process.env.NODE_ENV === 'production'
    ? config.previewUrl
    : 'http://localhost:3000'
