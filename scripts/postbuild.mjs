import { cp } from 'fs/promises'
import { join } from 'path'

const src = join(process.cwd(), 'apps/blog/node_modules/.bundle')
const dst = join(
  process.cwd(),
  process.env.NODE_ENV === 'production'
    ? '.vercel/output/functions/api/execute.func/snippets'
    : 'apps/blog/.next/snippets'
)

console.log(`Copied to ${dst}`)
await cp(src, dst, { recursive: true })
