/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { CopyIcon } from 'lucide-react'
import { ComponentPropsWithoutRef, useRef } from 'react'

export function CodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<'code'>) {
  const codeRef = useRef<HTMLElement>(null)
  const language = props.className?.replace(/language-/, '') ?? 'plaintext'

  const handleCopy = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.innerText)
    }
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
      <code
        ref={codeRef}
        className={`language-${language} overflow-auto`}
        {...props}
      >
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
