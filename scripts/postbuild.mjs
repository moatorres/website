import { cp } from 'fs/promises'
import { join } from 'path'

const src = join(process.cwd(), 'apps/blog/node_modules/.bundle')

const prodDst = join(process.cwd(), 'apps/blog/src/app/api/execute/snippets')
const devDst = join(process.cwd(), 'apps/blog/.next/snippets')

const dst = process.env.NODE_ENV === 'production' ? prodDst : devDst

await cp(src, dst, { recursive: true })
