import crypto from 'crypto'

import bcrypt from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'

// Use an environment variable or a vault in production
const DEMO_JWT_SECRET = 'super_secret_jwt_key_1234567890'

type Payload = {
  uid: string // User ID stored in JWT payload
  iat: number // Issued at timestamp (seconds since epoch)
  exp: number // Expiration timestamp (seconds since epoch)
}

// Hash a plaintext password with bcrypt using salt rounds = 10
async function hash(password: string) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Compare plaintext password with stored bcrypt hash
async function compare(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

// Convert string secret into Uint8Array required by jose library
function getSecretKey(secret: string) {
  return new TextEncoder().encode(secret)
}

// Generate a cryptographically secure random hex string of given byte size
function generateRandomString(size = 32) {
  return crypto.randomBytes(size).toString('hex')
}

// Create a JWT signed with HS256 including uid, issued at, and expiration claims
async function sign(uid: string, key: string) {
  const iat = Math.floor(Date.now() / 1000) // Current time in seconds
  const exp = iat + 60 * 15 // Token expires in 15 minutes
  return await new SignJWT({ uid }) // Payload with user ID
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecretKey(key))
}

// Verify a JWT and return the payload if valid, otherwise null
async function verify(token: string, key: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(key))
    return payload as Payload
  } catch {
    return null // Return null if token invalid or expired
  }
}

async function main() {
  const password = 'user_password_1234567890'
  console.log('User Password:', password)

  // Hash the password
  const hashedPassword = await hash(password)
  console.log('Hashed Password:', hashedPassword)

  // Verify password matches the hash
  const isMatch = await compare(password, hashedPassword)
  console.log('Passwords Match?', isMatch) // true

  // Check wrong password against hash to demonstrate failed auth
  const isNotMatch = await compare('wrongpassword', hashedPassword)
  console.log('Passwords Match?', isNotMatch) // false

  const uid = crypto.randomUUID() // Generate a unique user ID
  console.log('User ID:', uid)

  const key = DEMO_JWT_SECRET // Use demo secret key
  console.log('JWT Secret:', key)

  // Sign JWT token with the user ID
  const token = await sign(uid, key)
  console.log('JWT Token:', token)

  // Create token signed with a random key (invalid for current secret)
  const invalidToken = await sign(uid, generateRandomString(32))

  // Attempt to verify invalid token with correct secret (should fail)
  const invalidPayload = await verify(invalidToken, key)
  console.log('Invalid Token:', invalidPayload) // null

  // Verify JWT token and decode payload
  const decoded = await verify(token, key)
  console.log('Decoded Token:', decoded) // Should show uid, iat, exp
}

main()
