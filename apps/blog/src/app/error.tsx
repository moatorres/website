'use client'

import { Button } from '@shadcn/ui'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Page } from '@/components/page'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <Page>
      <div className="flex items-center min-h-[75vh] m-auto px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="w-full space-y-6 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              Looks like our servers took an unexpected coffee break. ☕️
            </h1>
            <pre>500 Internal Server Error</pre>
            <div className="flex space-x-3 justify-center">
              <Button asChild variant="ghost">
                <Link href="/">
                  <ArrowLeft />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" onClick={() => reset()}>
                <RefreshCw />
                Reload
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
