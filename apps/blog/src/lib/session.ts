/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use server'

import crypto from 'crypto'

import bcrypt from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import 'server-only'

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const isProduction = process.env.NODE_ENV === 'production'

const AUTHOR_ID = String(1)
const CSRF_COOKIE = String('csrf')
const SESSION_COOKIE = String('session')

const APP_SECRET = String(process.env.APP_SECRET)
const JWT_SECRET = String(process.env.JWT_SECRET)

// ------------------------------------------------------------------
// Authentication
// ------------------------------------------------------------------

type SessionPayload = {
  id: string
  csrf: string
  iat: number
  exp: number
}

const getSecretKey = (secret: string) => new TextEncoder().encode(secret)

const generateCsrfToken = () => crypto.randomBytes(32).toString('hex')

const signToken = async (id = AUTHOR_ID) => {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 30 // 30 minutes
  const csrf = generateCsrfToken()
  const token = await new SignJWT({ id, csrf })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecretKey(JWT_SECRET))
  return { token, csrf }
}

const verifyToken = async (token: string): Promise<SessionPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(JWT_SECRET))
    return payload as SessionPayload
  } catch {
    return null
  }
}

// ------------------------------------------------------------------
// Session Management
// ------------------------------------------------------------------

async function verifySession(req?: Request): Promise<SessionPayload | false> {
  const authorizationHeader = req?.headers
    .get('Authorization')
    ?.replace(/^Bearer\s/, '')

  const sessionToken = authorizationHeader?.replace('Bearer ', '')
  const sessionCookie = await getCookie(SESSION_COOKIE)

  const csrfHeader = req?.headers?.get('x-csrf-token')
  const csrfCookie = await getCookie(CSRF_COOKIE)

  const csrf = csrfHeader ?? csrfCookie
  if (!csrf) return false

  const token = sessionToken ?? sessionCookie
  if (!token) return false

  const session = await verifyToken(token)
  if (!session) return false

  if (session.csrf !== csrf) return false

  return session
}

async function deleteSession(redir = false, path = '/'): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(CSRF_COOKIE)
  if (!redir) return
  redirect(path)
}

// ------------------------------------------------------------------
// Utilities
// ------------------------------------------------------------------

async function checkPassword(password: string) {
  if (isProduction) {
    return await bcrypt.compare(password, APP_SECRET)
  }
  return password === APP_SECRET
}

async function getCookie(key: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  const found = cookieStore.get(key)
  return found?.value
}

async function isAdmin(): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  if (session.id !== AUTHOR_ID) return false
  return true
}

// ------------------------------------------------------------------
// Server Actions
// ------------------------------------------------------------------

const attempts = new Map<string, { count: number; lastAttempt: number }>()

async function signIn(
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

// ------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------

export {
  checkPassword,
  deleteSession,
  isAdmin,
  signIn,
  signToken,
  verifySession,
  verifyToken,
}
