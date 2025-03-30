/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { readFileSync } from 'fs'
import { join } from 'path'

import config from '../data/config.json'

import { ContentMetadata } from './types'

export function getArticles() {
  return JSON.parse(
    readFileSync(join(config.metadataDirectory, 'articles.json')).toString()
  ) as ContentMetadata[]
}

export function getLatestArticles() {
  const metadata = getArticles()
  return metadata
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3) as ContentMetadata[]
}
