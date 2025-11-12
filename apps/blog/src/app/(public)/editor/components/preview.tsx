'use client'

import { Button, Input } from '@shadcn/ui'
import {
  ArrowLeft,
  ArrowRight,
  Fullscreen,
  Loader2,
  Minimize,
  RefreshCw,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

interface PreviewProps {
  url: string | null
  isLoading?: boolean
}

export function Preview({ url, isLoading }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [inputValue, setInputValue] = useState('/')
  const [history, setHistory] = useState<string[]>(['/'])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false)

  useEffect(() => {
    if (url) {
      setCurrentPath('/')
      setInputValue('/')
      setHistory(['/'])
      setHistoryIndex(0)
    }
  }, [url])

  useEffect(() => {
    if (iframeRef.current && url) {
      const fullUrl = url + (currentPath === '/' ? '' : currentPath)
      iframeRef.current.src = fullUrl
    }
  }, [url, currentPath])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewFullscreen) {
        setIsPreviewFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPreviewFullscreen])

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault()
    let path = inputValue.trim()
    if (!path.startsWith('/')) {
      path = '/' + path
    }
    setCurrentPath(path)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(path)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const path = history[newIndex]
      setCurrentPath(path)
      setInputValue(path)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const path = history[newIndex]
      setCurrentPath(path)
      setInputValue(path)
    }
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      // eslint-disable-next-line no-self-assign -- used to force iframe reload
      iframeRef.current.src = iframeRef.current.src
    }
  }

  if (!url && !isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-background">
        <div className="text-center">
          <div className="text-4xl mb-2">🚀</div>
          <p className="text-sm">Start a dev server to see preview</p>
          <p className="text-xs mt-2 text-muted-foreground/70">
            Run{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded">npm run dev</code>{' '}
            or <code className="bg-muted px-1.5 py-0.5 rounded">pnpm dev</code>
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm">Starting server...</p>
        </div>
      </div>
    )
  }

  const previewContent = (
    <>
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleBack}
          disabled={historyIndex === 0}
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleForward}
          disabled={historyIndex === history.length - 1}
          title="Forward"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRefresh}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <form
          onSubmit={handleNavigate}
          className="flex-1 flex items-center gap-2"
        >
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="/path"
            className="h-8 text-sm font-mono"
          />
        </form>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
          title={
            isPreviewFullscreen ? 'Exit Fullscreen (ESC)' : 'Fullscreen Preview'
          }
        >
          {isPreviewFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Fullscreen className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={url || ''}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </>
  )

  if (isPreviewFullscreen) {
    return (
      <div className="fixed inset-0 z-100 bg-background flex flex-col">
        {previewContent}
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-background flex flex-col relative">
      {previewContent}
    </div>
  )
}
