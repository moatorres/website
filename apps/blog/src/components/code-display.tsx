/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { useEffect, useState } from 'react'

interface CodeDisplayProps {
  code: string
  language: string
}

export function CodeDisplay({ code, language }: CodeDisplayProps) {
  const [highlighted, setHighlighted] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you'd use a syntax highlighting library like Prism.js or highlight.js
    // This is a simplified version that just wraps the code in a pre tag
    setHighlighted(code)
  }, [code, language])

  if (!highlighted) {
    return <div className="animate-pulse h-64 bg-muted rounded"></div>
  }

  return (
    <pre className="font-mono text-sm p-4 overflow-x-auto bg-muted rounded-md">
      <code>{highlighted}</code>
    </pre>
  )
}
