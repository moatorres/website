'use server'

import { jwtVerify, SignJWT } from 'jose'

import 'server-only'

const JWT_SECRET = String(process.env.JWT_SECRET)

const getSecretKey = (secret: string) => new TextEncoder().encode(secret)

export const generateNonce = async () => {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 5 // 5 minutes

  const token = await new SignJWT({ kid: 'moatorres.co/nonce' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecretKey(JWT_SECRET))

  return token
}

type NoncePayload = {
  kid: string
  iat: number
  exp: number
}

export const verifyNonce = async (
  token: string
): Promise<NoncePayload | false> => {
  try {
    const { payload } = await jwtVerify<NoncePayload>(
      token,
      getSecretKey(JWT_SECRET)
    )
    return payload
  } catch {
    return false
  }
}
