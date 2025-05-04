/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { readFileSync } from 'fs'
import { join } from 'path'

import { memoize } from '@blog/utils'

import config from '@/data/config.json'

export type PhotoMetadata = {
  id: number
  src: string
  alt: string
  width: number
  height: number
  category?: string
}

/**
 * Retrieves and parses the list of photo metadata from a JSON file.
 * @throws {Error} If the file cannot be read or the content is not valid JSON.
 */
export const getPhotos = memoize(function getPhotos() {
  const filePath = join(config.metadataDirectory, 'photos.json')
  const fileContent = readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContent) as PhotoMetadata[]
})

/**
 * Returns a list of unique photo categories.
 * @returns An array of unique photo categories.
 */
export const getPhotoCategories = memoize(function getPhotoCategories() {
  const uniqueCategories = new Set(getPhotos().map((photo) => photo.category))
  return Array.from(uniqueCategories).filter(Boolean)
})

/**
 * Retrieves photos filtered by category and sorted by ID.
 * @returns An array of photos belonging to the specified category, sorted by ID.
 */
export const getPhotosByCategory = memoize(function getPhotoByCategory(
  category: string
) {
  return getPhotos()
    .filter((photo) => photo.category === category)
    .sort((a, b) => a.id - b.id)
})

/**
 * Retrieves a single photo by its ID.
 * @throws {Error} If no photo is found for the provided ID.
 * @returns The photo metadata object if found, otherwise undefined.
 */
export const getPhotoById = memoize(function getPhotoById(id: number) {
  const photo = getPhotos().find((photo) => photo.id === id)
  if (!photo) {
    throw new Error(`No photo found for ID: ${id}`)
  }
  return photo
})
