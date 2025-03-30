/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { getJestProjectsAsync } from '@nx/jest'
import type { Config } from 'jest'

export default async (): Promise<Config> => ({
  projects: await getJestProjectsAsync(),
})
