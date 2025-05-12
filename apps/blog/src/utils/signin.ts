'use server'

import { cookies, headers } from 'next/headers'

import 'server-only'

import { checkPassword, signToken } from './auth'

const isProduction = process.env.NODE_ENV === 'production'

const AUTHOR_ID = String(1)
const CSRF_COOKIE = String('csrf')
const SESSION_COOKIE = String('session')

const attempts = new Map<string, { count: number; lastAttempt: number }>()

export async function signin(
  state: {
    data: { password: string }
    error: string | null
    success: boolean
  },
  formData: FormData
) {
  const requestHeaders = await headers()

  const ip = requestHeaders.get('x-forwarded-for') ?? 'local'
  const now = Date.now()
  const entry = attempts.get(ip) ?? { count: 0, lastAttempt: now }

  // block ip for 15min after 5 failed attempts
  if (now - entry.lastAttempt < 15 * 60 * 1000 && entry.count >= 5) {
    return { ...state, error: 'Too many login attempts. Try again later.' }
  }

  entry.count++
  entry.lastAttempt = now
  attempts.set(ip, entry)

  const password = formData.get('password')?.toString() ?? ''

  if (isProduction && password.length < 12) {
    return {
      ...state,
      error: 'Your password is too short.',
    }
  }

  const isValidPassword = await checkPassword(password)

  if (!isValidPassword) {
    return { ...state, error: 'Wrong password.' }
  } else {
    attempts.delete(ip)
  }

  const store = await cookies()

  const { token, csrf } = await signToken(AUTHOR_ID)

  store.set(SESSION_COOKIE, token, {
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes in millis
    httpOnly: isProduction,
    maxAge: 30 * 60, // 30 minutes in seconds
    path: '/',
    sameSite: isProduction ? 'strict' : 'lax',
    secure: isProduction,
  })

  store.set(CSRF_COOKIE, csrf, {
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes in millis
    httpOnly: false,
    maxAge: 30 * 60, // 30 minutes in seconds
    path: '/',
    sameSite: isProduction ? 'strict' : 'lax',
    secure: isProduction,
  })

  return { ...state, error: null, success: true }
}
