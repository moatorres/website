import { cp } from 'fs/promises'
import { join } from 'path'

const src = join(process.cwd(), 'apps/blog/node_modules/.bundle')
const dst = join(process.cwd(), 'apps/blog/.next', 'snippets')

await cp(src, dst, { recursive: true })
