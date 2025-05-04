/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/button'
import { Page } from '@/components/page'

export default function NotFound() {
  return (
    <Page>
      <div className="flex items-center min-h-[75vh] px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="w-full space-y-6 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              Looks like you&apos;ve ventured into the unknown digital realm. 🧑🏼‍🚀
            </h1>
            <pre>400 Not Found</pre>
            <div className="flex space-x-3 justify-center">
              <Button asChild variant="soft">
                <Link href="/">
                  <ArrowLeft />
                  Home
                </Link>
              </Button>
              <Button variant="soft" onClick={() => window.location.reload()}>
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
