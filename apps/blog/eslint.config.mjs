/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import js from '@eslint/js'
import { fixupConfigRules } from '@eslint/compat'
import nx from '@nx/eslint-plugin'
import baseConfig from '../../eslint.config.mjs'
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
})

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  ...fixupConfigRules(compat.extends('next')),
  ...fixupConfigRules(compat.extends('next/core-web-vitals')),
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['.next/**/*'],
  },
]
