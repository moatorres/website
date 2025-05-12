/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import path from 'path'

import {
  getDefaultConfig,
  getEnvConfig,
  getJsonConfig,
  resolveConfig,
  transformConfig,
} from './config'
import { ConfigDecoded, ConfigMap, transforms } from './config-schema'

describe('config.ts', () => {
  const before = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {} // reset env for each test
  })

  afterAll(() => {
    process.env = before // restore original env
  })

  describe('ConfigMap', () => {
    it('should have the correct structure', () => {
      Object.entries(ConfigMap).forEach(([_, value]) => {
        expect(value).toHaveProperty('variable')
        expect(value).toHaveProperty('fallback')
      })

      const hasTransform = Object.values(ConfigMap).some(
        (value) => value.transform !== undefined
      )
      expect(hasTransform).toBe(true)
    })

    it('should have unique variable names', () => {
      const variables = Object.values(ConfigMap).map((v) => v.variable)
      const uniqueVariables = new Set(variables)
      expect(uniqueVariables.size).toBe(variables.length)
    })
  })

  describe('getDefaultConfig', () => {
    it('should return a default configuration with fallback values', () => {
      const config = getDefaultConfig()
      Object.entries(ConfigMap).forEach(([key, value]) => {
        if (value.transform) {
          const transformFn = transforms[value.transform]
          expect(JSON.stringify(config[key as keyof ConfigDecoded])).toBe(
            JSON.stringify(transformFn(value.fallback))
          )
        } else {
          expect(config[key as keyof ConfigDecoded]).toBe(value.fallback)
        }
      })
    })
  })

  describe('resolveConfig', () => {
    it('should override empty strings with fallback values', () => {
      process.env.NEXT_PUBLIC_AUTHOR_NAME = ''
      const config = {
        contentDirectory: '',
        sections: '',
      }
      const expected = getDefaultConfig()
      const received = resolveConfig(ConfigMap, config)
      expect(received).toMatchObject(expected)
    })

    it('should prioritize `process.env` over `info.json`', () => {
      process.env.NEXT_PUBLIC_AUTHOR_NAME = 'Env Author'
      const config = {
        author: 'JSON Author',
      }
      const result = resolveConfig(ConfigMap, config)
      expect(result.author).toBe('Env Author')
    })

    it('should return default values if no config is provided', async () => {
      const expected = getDefaultConfig()
      const received = resolveConfig(ConfigMap, {})
      expect(received).toEqual(expected)
    })

    it('should handle undefined transform safely', () => {
      process.env.NEXT_PUBLIC_AUTHOR_NAME = 'Env Author'
      const result = resolveConfig(ConfigMap, {})
      expect(result.author).toBe('Env Author')
    })

    it('should transform values if transform is defined', () => {
      const config = {
        sections: 'blog,talks',
        contentDirectory: 'some/path',
      }
      const expected = {
        sections: [{ name: 'blog' }, { name: 'talks' }],
        contentDirectory: path.join(process.cwd(), 'some/path'),
      }
      const received = resolveConfig(ConfigMap, config)
      expect(received).toMatchObject(expected)
    })
  })

  describe('transformConfig', () => {
    it('should return valid config with only fallbacks', () => {
      const config = transformConfig()
      expect(config).toMatchObject<Partial<ConfigDecoded>>({
        author: 'John Doe',
        sections: [{ name: 'blog' }],
      })
    })

    it('should use values from provided JSON config', () => {
      const json = {
        author: 'Anna Smith',
        sections: 'talks,projects',
      }

      const config = transformConfig(json)

      expect(config.author).toBe('Anna Smith')
      expect(config.sections).toEqual([{ name: 'talks' }, { name: 'projects' }])
    })

    it('should prefer env vars over JSON config', () => {
      process.env.NEXT_PUBLIC_AUTHOR_NAME = 'Env Author'
      const json = {
        author: 'JSON Author',
      }

      const config = transformConfig(json)
      expect(config.author).toBe('Env Author')
    })

    it('should apply transformation functions (absolute paths)', () => {
      const config = transformConfig({
        contentDirectory: 'src/data',
      })

      expect(config.contentDirectory).toMatch(/src\/data$/)
      expect(config.contentDirectory).toContain(process.cwd())
    })

    it('should merge multiple config sources in order ', () => {
      process.env[ConfigMap.githubUrl.variable] = 'github.com/env'
      const cfg1 = { author: 'A1' }
      const cfg2 = { author: 'B2', description: 'Desc' }
      const cfg3 = { author: 'C3', description: '', githubUrl: 'github.com/3' }

      const result = transformConfig(cfg1, cfg2, cfg3)
      expect(result.author).toBe('C3')
      expect(result.description).toBe('Desc')
      expect(result.githubUrl).toBe('github.com/env')
    })
  })

  describe('transforms', () => {
    it('should transform sections string to array of objects', () => {
      const sections = 'blog,talks'
      const transformed = transforms.sections(sections)
      expect(transformed).toEqual([{ name: 'blog' }, { name: 'talks' }])
    })

    it('should transform contentDirectory to absolute path', () => {
      const contentDirectory = 'src/data'
      const transformed = transforms.absolute(contentDirectory)
      expect(transformed).toBe(path.join(process.cwd(), contentDirectory))
    })
  })

  describe('getJsonConfig', () => {
    it('should warn if the config file is not found', () => {
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => void 0)

      getJsonConfig('nonexistent.json')

      expect(consoleSpy).toHaveBeenCalledTimes(1)
      consoleSpy.mockRestore()
    })

    it('should return an empty object if no config file is found', () => {
      const config = getJsonConfig('nonexistent.json')
      expect(config).toEqual({})
    })

    it.todo(' add test fixtures for JSON config')

    it.skip('should return the correct JSON config', () => {
      process.env.APP_CONFIG_FILE = 'apps/blog/fixtures/info.json'
      const config = getJsonConfig()
      expect(config.author).toBe('Test Author')
      expect(config.sections).toEqual('test,example')
    })
  })

  describe('getEnvConfig', () => {
    it('should return the correct environment variable values', () => {
      process.env.NEXT_PUBLIC_AUTHOR_NAME = 'Env Author'
      process.env.APP_CONTENT_DIRECTORY = 'src/content'
      const config = getEnvConfig()
      expect(config.author).toBe('Env Author')
      expect(config.contentDirectory).toBe('src/content')
    })

    it('should not return undefined for missing environment variables', () => {
      delete process.env.NEXT_PUBLIC_AUTHOR_NAME
      const config = getEnvConfig()
      expect(config.author).toBeUndefined()
    })

    it('should not return environment variables with empty string values', () => {
      process.env.NEXT_PUBLIC_AUTHOR_NAME = ''
      const config = getEnvConfig()
      expect(config.author).not.toBeDefined()
    })

    it('should not return environment variables with null values', () => {
      process.env.NEXT_PUBLIC_AUTHOR_NAME = null as unknown as string
      const config = getEnvConfig()
      expect(config.author).not.toBeDefined()
    })
  })
})
