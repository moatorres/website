'use server'

import crypto from 'crypto'

import bcrypt from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import 'server-only'

const isProduction = process.env.NODE_ENV === 'production'

const AUTHOR_ID = String(1)
const CSRF_COOKIE = String('csrf')
const SESSION_COOKIE = String('session')

const APP_SECRET = String(process.env.APP_SECRET)
const JWT_SECRET = String(process.env.JWT_SECRET)

export const checkPassword = async (password: string) => {
  if (isProduction) {
    return await bcrypt.compare(password, APP_SECRET)
  }
  return password === APP_SECRET
}

const getSecretKey = (secret: string) => new TextEncoder().encode(secret)

const generateCsrfToken = () => crypto.randomBytes(32).toString('hex')

export const signToken = async (id = AUTHOR_ID) => {
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

export async function getCookie(key: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  const found = cookieStore.get(key)
  return found?.value
}

type SessionPayload = {
  id: string
  csrf: string
  iat: number
  exp: number
}

export const verifyToken = async (
  token: string
): Promise<SessionPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(JWT_SECRET))
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function verifySession(
  req?: Request
): Promise<false | SessionPayload> {
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

export async function deleteSession(redir = false, path = '/') {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(CSRF_COOKIE)
  if (!redir) return
  redirect(path)
}

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await verifySession()
  if (!session) return false
  return true
}

export const isAdmin = async (): Promise<boolean> => {
  const session = await verifySession()
  if (!session) return false
  if (session.id !== AUTHOR_ID) return false
  return true
}
