import { readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(
    `${dirname(fileURLToPath(import.meta.url))}/.spec.swcrc`,
    'utf-8'
  )
)

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false

export default {
  displayName: 'utils',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
}
