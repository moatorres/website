'use server'

import { execFile, execSync } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import * as z from '@zod/mini'
import { NextRequest, NextResponse } from 'next/server'

import 'server-only'

const NONCE_HEADER = String('nonce')

const Body = z.object({
  name: z.string().check(z.minLength(2), z.maxLength(32)),
})

export async function POST(req: NextRequest) {
  const nonce = req?.headers?.get(NONCE_HEADER)

  if (!nonce) {
    return NextResponse.json(
      { message: 'Bad Request', cause: 'Missing nonce.' },
      { status: 400 }
    )
  }

  let body: z.infer<typeof Body>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { message: 'Bad Request', cause: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  const parsed = Body.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Bad Request',
        cause: 'Invalid name.',
        errors: parsed.error.issues,
      },
      { status: 400 }
    )
  }

  const __dirname = dirname(fileURLToPath(import.meta.url))

  const productionPath = resolve(
    process.cwd(), // /var/task/apps/blog
    'src/app/api/execute/snippets',
    `${parsed.data.name}.js`
  )

  const developmentPath = resolve(
    __dirname,
    '../../../../node_modules/.bundle',
    `${parsed.data.name}.js`
  )

  const filePath =
    process.env.NODE_ENV === 'production' ? productionPath : developmentPath

  const stream = new ReadableStream({
    start(controller) {
      const child = execFile('node', [filePath])

      child.stdout?.on('data', (chunk) => {
        controller.enqueue(new TextEncoder().encode(chunk))
      })

      child.stderr?.on('data', (chunk) => {
        controller.enqueue(new TextEncoder().encode(chunk))
      })

      child.on('close', () => {
        controller.close()
      })

      child.on('error', (err) => {
        controller.enqueue(new TextEncoder().encode(err.message))
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
