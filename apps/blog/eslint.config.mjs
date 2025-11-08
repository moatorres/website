import nx from '@nx/eslint-plugin'
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['.next/**/*', './src/data/**/*', './public/_*', 'next-env.d.ts'],
  },
]
