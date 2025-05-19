'use server'

import * as z from '@zod/mini'
import { NextResponse } from 'next/server'

import { checkPassword, signToken } from '@/lib/session'

import 'server-only'

const isProduction = process.env.NODE_ENV === 'production'

const Body = z.object({
  password: z.string().check(z.minLength(isProduction ? 12 : 1)),
})

const AUTHOR_ID = String(1)

export async function POST(req: Request) {
  let requestBody

  try {
    requestBody = await req.json()
  } catch {
    return NextResponse.json({ message: 'Bad Request' }, { status: 400 })
  }

  let parsed: z.infer<typeof Body>

  try {
    parsed = Body.parse(requestBody)
  } catch {
    return NextResponse.json({ message: 'Bad Request' }, { status: 400 })
  }

  const isValidPassword = await checkPassword(parsed.password)

  if (!isValidPassword) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { token, csrf } = await signToken(AUTHOR_ID)

  const response = NextResponse.json({ message: 'Authorized' }, { status: 200 })

  response.headers.set('Authorization', `Bearer ${token}`)

  response.headers.set('X-CSRF-Token', csrf)

  response.cookies.set('session', token, {
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes in millis
    httpOnly: isProduction,
    maxAge: 30 * 60, // 30 minutes in seconds
    path: '/',
    sameSite: isProduction ? 'strict' : 'lax',
    secure: isProduction,
  })

  response.cookies.set('csrf', csrf, {
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes in millis
    httpOnly: false,
    maxAge: 30 * 60, // 30 minutes in seconds
    path: '/',
    sameSite: isProduction ? 'strict' : 'lax',
    secure: isProduction,
  })

  return response
}
