/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

interface ExecutionPanelProps {
  result: string | null
}

export function ExecutionPanel({ result }: ExecutionPanelProps) {
  return (
    <div className="min-h-[200px] p-4 bg-muted rounded-md font-mono text-sm">
      {result ? (
        <pre>{result}</pre>
      ) : (
        <div className="text-muted-foreground">
          Click &quot;Run Code&quot; to execute the snippet and see the result
          here.
        </div>
      )}
    </div>
  )
}
