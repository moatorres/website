/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/button'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex items-center min-h-[75vh] px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tighter">500</h1>
          <p>Something went wrong.</p>
          <div className="flex space-x-3 justify-center">
            <Button asChild>
              <Link href="/">
                <ArrowLeft />
                Home
              </Link>
            </Button>
            <Button variant="soft" onClick={() => reset()}>
              <RefreshCw />
              Reload
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
