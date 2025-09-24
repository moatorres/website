'use client'

import { slugify, stripAnsiCodes } from '@blog/utils'
import {
  Badge,
  Button,
  ScrollArea,
  ScrollBar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shadcn/ui'
import { Code } from 'codice'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  CheckIcon,
  CopyIcon,
  Loader2Icon,
  PlayIcon,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useNonce } from '@/components/context/nonce'
import { Flex } from '@/components/ui/flex'
import { Skeleton } from '@/components/ui/skeleton'
import { Snippet } from '@/lib/snippets'

const NONCE_HEADER = String('nonce')

export function SnippetView({ data }: { data: Snippet }) {
  const [snippet, setSnippet] = React.useState<Snippet | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const [output, setOutput] = React.useState<string[]>([])
  const [isRunning, setIsRunning] = React.useState(false)
  const nonce = useNonce()

  React.useEffect(() => {
    const loadSnippet = async () => {
      try {
        setSnippet(data)
      } catch (error) {
        console.error('Failed to load snippet:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSnippet()
  }, [data])

  const handleCopyCode = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExecute = async () => {
    if (!snippet) return
    setOutput([])
    setIsRunning(true)

    const res = await fetch('/api/execute', {
      method: 'POST',
      body: JSON.stringify({ name: slugify(snippet?.title ?? '') }),
      headers: { [NONCE_HEADER]: nonce },
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    while (reader) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(Boolean)

      for (const line of lines) {
        setOutput((prev) => [...prev, line])
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    }

    setIsRunning(false)
  }

  if (loading) {
    return (
      <React.Fragment>
        <Skeleton className="h-8 bg-muted rounded w-1/4 mb-8" />
        <Skeleton className="h-8 bg-muted rounded w-3/4 mb-4" />
        <Skeleton className="h-4 bg-muted rounded w-1/2 mb-8" />
        <Skeleton className="h-64 bg-muted rounded mb-4" />
      </React.Fragment>
    )
  }

  if (!snippet) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Snippet not found</h1>
        <p className="mb-8">
          The snippet you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Tabs defaultValue="code">
      {snippet && (
        <div className="px-0 space-y-4">
          {snippet.description && (
            <p className="text-muted-foreground">{snippet.description}</p>
          )}
          <div className="flex items-center gap-2">
            <Badge className="capitalize">{snippet.language}</Badge>
            <span className="text-sm text-muted-foreground">
              Created{' '}
              {formatDistanceToNow(new Date(snippet.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <Flex className="flex-row justify-between">
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="execute">Execute</TabsTrigger>
            </TabsList>
            <Flex className="flex-row gap-2 align-middle">
              <Button size="sm" variant="outline" onClick={handleCopyCode}>
                {copied ? (
                  <CheckIcon strokeWidth={1.625} />
                ) : (
                  <CopyIcon strokeWidth={1.625} />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </Flex>
          </Flex>

          <TabsContent value="code">
            <ScrollArea className="h-[64vh] sm:h-[70vh] rounded-md no-scrollbar">
              <Code
                controls
                title={snippet.title}
                className="text-xs bg-(--color-zinc-100)/80 dark:bg-(--color-zinc-950) w-[90ch] md:w-fit"
              >
                {snippet.code}
              </Code>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="execute">
            <div className="space-y-4">
              <Button onClick={handleExecute} size="sm" disabled={isRunning}>
                {isRunning ? (
                  <Loader2Icon strokeWidth={1.625} className="animate-spin" />
                ) : (
                  <PlayIcon strokeWidth={1.625} />
                )}
                {isRunning ? 'Running' : 'Run Snippet'}
              </Button>

              <ScrollArea className="h-[64vh] rounded-md bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
                <Code>
                  {output.map((line) => stripAnsiCodes(line)).join('\n')}
                </Code>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </TabsContent>
        </div>
      )}
    </Tabs>
  )
}
