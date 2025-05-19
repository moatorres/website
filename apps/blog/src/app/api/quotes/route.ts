import { NextResponse } from 'next/server'

import { Category, getRandomQuote } from '@/lib/quotes'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject') ?? 'random'
  const quote = getRandomQuote(subject as Category)
  return NextResponse.json(quote)
}
