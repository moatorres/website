import { getAll } from '@vercel/edge-config'
import { NextResponse } from 'next/server'

import { verifySession } from '@/lib/session'
import { MetaConfigEncoded } from '@/utils/config-schema'

const VERCEL_API_KEY = String(process.env.VERCEL_API_KEY)
const VERCEL_EDGE_CONFIG_ID = String(process.env.EDGE_CONFIG_ID)

export async function GET(req: Request) {
  const authorized = await verifySession(req)

  if (!authorized) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const edgeConfigStore = await getAll()
  const parsed = MetaConfigEncoded.safeParse(edgeConfigStore)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid config data', errors: parsed.error.issues },
      { status: 400 }
    )
  }

  const config = parsed.data

  return NextResponse.json(config)
}

export async function POST(req: Request) {
  const authorized = await verifySession()

  if (!authorized) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  let body: MetaConfigEncoded
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = MetaConfigEncoded.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid config data', errors: parsed.error.issues },
      { status: 400 }
    )
  }

  const updates = parsed.data

  try {
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${VERCEL_EDGE_CONFIG_ID}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${VERCEL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: Object.entries(updates).map(([key, value]) => ({
            operation: 'upsert',
            key,
            value,
          })),
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: 'Failed to update Edge Config', error },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Config updated' })
  } catch (err) {
    return NextResponse.json(
      { message: 'Unexpected error', error: (err as Error).message },
      { status: 500 }
    )
  }
}
