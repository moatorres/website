import { NextResponse } from 'next/server'
import { unfurl } from 'unfurl.js'

export async function POST(req: Request) {
  const { url } = await req.json()

  try {
    const metadata = await unfurl(url)
    console.dir(metadata, { depth: null })
    return NextResponse.json(metadata)
  } catch {
    return NextResponse.json(
      { error: 'Failed to unfurl URL.' },
      { status: 500 }
    )
  }
}
