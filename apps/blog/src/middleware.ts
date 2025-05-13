/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use server'

import { type NextRequest, NextResponse } from 'next/server'

import { verifyToken } from './lib/session'

export async function middleware(req: NextRequest) {
  const protectedRoutes = ['/about', '/dashboard']
  const currentPath = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) =>
    currentPath.startsWith(route)
  )

  if (!isProtectedRoute) return NextResponse.next()

  const token = req.cookies.get('session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const isValidToken = await verifyToken(token)

  if (!isValidToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
}
