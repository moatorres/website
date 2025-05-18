import { cp } from 'fs/promises'
import { join } from 'path'

const src = join(process.cwd(), 'apps/blog/node_modules/.bundle')

console.log('cwd at postbuild', process.cwd())

const prodDst = join(process.cwd(), 'app/blog/src/app/api/execute/snippets')
const devDst = join(process.cwd(), 'apps/blog/.next/snippets')

const dst = process.env.NODE_ENV === 'production' ? prodDst : devDst

console.log(`Copied to ${dst}`)
await cp(src, dst, { recursive: true })
