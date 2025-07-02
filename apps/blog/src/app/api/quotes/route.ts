import { NextResponse } from 'next/server'

import { Category, getRandomQuote } from '@/lib/quotes'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') ?? 'random'
  const quote = getRandomQuote(category as Category)
  return NextResponse.json(quote)
}
