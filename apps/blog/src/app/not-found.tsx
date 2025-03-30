import React from 'react'

export default function NotFound() {
  return (
    <div className="flex items-center min-h-[75vh] px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tighter">404</h1>
          <p>Page not found.</p>
        </div>
      </div>
    </div>
  )
}
