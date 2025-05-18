import { execSync } from 'child_process'
import { cp } from 'fs/promises'
import { join } from 'path'

const src = join(process.cwd(), 'apps/blog/node_modules/.bundle')

console.log('cwd at postbuild', process.cwd())

const prodDst = join(
  process.cwd(),
  '.vercel/output/functions/api/execute.func/snippets'
)
const devDst = join(process.cwd(), 'apps/blog/.next/snippets')

const dst = process.env.NODE_ENV === 'production' ? prodDst : devDst

console.log(`Copied to ${dst}`)
await cp(src, dst, { recursive: true })

console.log(
  execSync(
    'ls -la .vercel/output/functions/api/execute.func/snippets'
  ).toString()
)
