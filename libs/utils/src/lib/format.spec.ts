import {
  absolutePath,
  capitalize,
  initials,
  prune,
  relativePath,
  slugify,
} from './format.js'

describe('format.ts', () => {
  describe('slugify', () => {
    it('should convert a string to a URL-friendly slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
      expect(slugify('React & Redux')).toBe('react-and-redux')
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces')
    })
  })

  describe('initials', () => {
    it('should return the initials of a string', () => {
      expect(initials('John Doe')).toBe('JD')
      expect(initials('Jane Ann Doe', 2)).toBe('JA')
      expect(initials('Single', 1)).toBe('S')
      expect(initials('John Doe', 2, '.')).toBe('J.D.')
      expect(initials('John Ann Doe', 3)).toBe('JAD')
    })
  })

  describe('prune', () => {
    it('should remove undefined, null, and empty string values from an object', () => {
      const obj = { a: 1, b: undefined, c: null, d: '', e: 'value' }
      expect(prune(obj)).toEqual({ a: 1, e: 'value' })
    })
  })

  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('world')).toBe('World')
    })
  })

  describe('relativePath', () => {
    it('should return the relative path from the current working directory', () => {
      const cwd = process.cwd()
      const absolute = `${cwd}/src/index.ts`
      expect(relativePath(absolute)).toBe('/src/index.ts')
    })
  })

  describe('absolutePath', () => {
    it('should return the absolute path given a relative path', () => {
      const cwd = process.cwd()
      const relative = 'src/index.ts'
      expect(absolutePath(relative)).toBe(`${cwd}/src/index.ts`)
    })
  })
})
