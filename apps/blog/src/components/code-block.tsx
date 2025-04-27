'use client'

import { CopyIcon } from 'lucide-react'
import { ComponentPropsWithoutRef } from 'react'

export function CodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<'code'>) {
  const language = props.className?.replace(/language-/, '') ?? 'plaintext'

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children))
  }

  if (language === 'plaintext') {
    return (
      <code className={`language-${language}`} {...props}>
        {children}
      </code>
    )
  }

  return (
    <pre className="pre-wrapper relative">
      <code className={`language-${language}`} {...props}>
        {children}
      </code>

      <button
        onClick={handleCopy}
        className="absolute top-1 right-0 cursor-pointer opacity-50 hover:opacity-100 active:opacity-50 active:scale-95 transition-all duration-200 ease-in-out"
        aria-label="Copy code"
      >
        <CopyIcon className="h-4 w-4" />
      </button>
    </pre>
  )
}
