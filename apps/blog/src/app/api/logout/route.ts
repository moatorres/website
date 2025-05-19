'use server'

import { NextResponse } from 'next/server'

import { deleteSession } from '@/lib/session'

export async function GET(req: Request) {
  await deleteSession()
  return NextResponse.json({ message: 'Logged out' }, { status: 200 })
}
