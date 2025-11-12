'use client'

import { memoize } from '@blog/utils'

import projects from '@/data/projects.json'

import type { Project } from './types'

/**
 * An array of playground projects.
 *
 * Casting from unknown because `project.files` is a union of all projects' files
 * and inferred type would be Record<string, string | undefined> otherwise.
 *
 * @todo Desambiguate name `projects` (a "project" could be unrelated to the playground)
 */
export const getProjects = memoize(() => projects as unknown as Project[])

export const exampleProjects = getProjects()
