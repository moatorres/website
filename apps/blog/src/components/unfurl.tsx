'use client'

import { Avatar, AvatarImage } from '@shadcn/ui'
import Image from 'next/image'
import { useState } from 'react'

export function UnfurlPreview() {
  const [url, setUrl] = useState('')
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFetch = async () => {
    setLoading(true)
    const res = await fetch('/api/unfurl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()
    setMetadata(data)
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <input
        type="text"
        placeholder="Enter URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <button
        onClick={handleFetch}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!url || loading}
      >
        {loading ? 'Fetching...' : 'Unfurl'}
      </button>

      {metadata && !metadata.error && (
        <div className="mt-4 border p-4 rounded bg-white shadow">
          {metadata.open_graph?.image?.url && (
            <Image
              src={metadata.open_graph.images[0].url}
              alt="Preview"
              className="w-full h-48 object-cover rounded mb-2"
            />
          )}
          <h2 className="text-xl font-bold mb-1">
            {metadata.open_graph?.title || metadata.title}
          </h2>
          <p className="mb-2 text-gray-700">
            {metadata.open_graph?.description || metadata.description}
          </p>
          <Avatar>
            <AvatarImage src={metadata?.favicon} className="scale-125" />
          </Avatar>

          {metadata.keywords && (
            <div className="flex flex-wrap gap-2">
              {metadata.keywords.map((tag: string, idx: number) => (
                <a
                  key={idx}
                  href={`https://www.google.com/search?q=${encodeURIComponent(tag)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-sm px-2 py-1 rounded hover:bg-blue-100"
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {metadata?.error && (
        <p className="text-red-600 mt-4">Error: {metadata.error}</p>
      )}
    </div>
  )
}
