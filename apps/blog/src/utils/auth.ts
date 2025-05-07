'use server'

import { readFileSync } from 'fs'
import { join } from 'path'

import bcrypt from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import 'server-only'

const isProduction = process.env.NODE_ENV === 'production'

const AUTHOR_ID = String(1)
const COOKIE_NAME = String('session')
const JWT_SECRET = String(process.env.JWT_SECRET)

function getHash() {
  const appSecret = process.env.APP_SECRET
  const devSecret = join(process.cwd(), 'src/data/hash.txt')
  if (!isProduction) return readFileSync(devSecret, 'utf-8').trim()
  if (appSecret && appSecret.length > 0) return appSecret
  throw new Error('Did you forget to set the APP_ADMIN_SECRET?')
}

const compare = async (password: string, hash: string) => {
  const isMatch = await bcrypt.compare(password, hash)
  return isMatch
}

const getSecretKey = (secret: string) => new TextEncoder().encode(secret)

const signToken = async (userId = AUTHOR_ID) => {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 30 // 30 minutes
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('blogx')
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecretKey(JWT_SECRET))
  return token
}

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(JWT_SECRET))
    return payload
  } catch {
    return null
  }
}

export const isAuthenticated = async () => {
  const kitchen = await cookies()
  const cookie = kitchen.get(COOKIE_NAME)?.value

  if (!cookie) {
    return false
  }

  const session = await verifyToken(cookie)

  if (!session) {
    return false
  }

  return session
}

export const isAdmin = async () => {
  const session = await isAuthenticated()
  if (!session) return false
  if (session.userId !== AUTHOR_ID) return false
  return true
}

export async function verifySession() {
  const store = await cookies()

  const cookie = store.get(COOKIE_NAME)?.value
  if (!cookie) return

  const session = await verifyToken(cookie)
  if (!session) return

  return session
}

export async function deleteSession(redir = false, path = '/') {
  const kitchen = await cookies()
  kitchen.delete(COOKIE_NAME)
  if (!redir) return
  redirect(path)
}

export async function signin(
  state: {
    data: { password: string }
    error: string | null
    success: boolean
  },
  formData: FormData
) {
  'use server'

  const password = formData.get('password')?.toString() ?? ''

  if (isProduction && password.length < 12) {
    return { ...state, error: 'Password is too small' }
  }

  const isMatch = await compare(password, getHash())

  if (!isMatch) {
    return { ...state, error: 'Wrong password' }
  }

  const store = await cookies()

  const token = await signToken(AUTHOR_ID)

  store.set(COOKIE_NAME, token, {
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    httpOnly: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60, // 30 minutes
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return { ...state, error: null, success: true }
}
