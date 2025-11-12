import { defineConfig } from 'eslint/config'

import nx from '@nx/eslint-plugin'
import nextPlugin from 'eslint-config-next'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import baseConfig from '../../eslint.config.mjs'

export default defineConfig([
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  nextPlugin,
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: ['.next/**/*', './src/data/**/*', './public/_*', 'next-env.d.ts'],
  },
])
