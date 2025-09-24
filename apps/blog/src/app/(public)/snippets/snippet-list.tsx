'use client'

import { slugify, stripAnsiCodes } from '@blog/utils'
import {
  Badge,
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  ScrollArea,
  ScrollBar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useIsMobile,
} from '@shadcn/ui'
import { Code } from 'codice'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowUpRightFromSquareIcon,
  CheckIcon,
  CopyIcon,
  Loader2Icon,
  PlayIcon,
  XIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

import { useNonce } from '@/components/context/nonce'
import { ButtonGroup } from '@/components/ui/button-group'
import { Flex } from '@/components/ui/flex'
import { InlineLink } from '@/components/ui/inline-link'
import { getLatestSnippets, getSnippetBySlug, Snippet } from '@/lib/snippets'

const NONCE_HEADER = String('nonce')

export default function SnippetList() {
  const [snippets, setSnippets] = React.useState<Snippet[]>([])
  const [loading, setLoading] = React.useState(true)
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [output, setOutput] = React.useState<string[]>([])
  const [isRunning, setIsRunning] = React.useState(false)
  const [selectedSnippet, setSelectedSnippet] = React.useState<Snippet | null>(
    null
  )
  const router = useRouter()
  const nonce = useNonce()
  const isMobile = useIsMobile()

  React.useEffect(() => {
    const loadSnippets = async () => {
      const snippets = getLatestSnippets()
      setSnippets(snippets)
      setLoading(false)
    }

    loadSnippets()
  }, [])

  const handleOpenSnippet = async (id: string) => {
    const snippet = getSnippetBySlug(id)
    setSelectedSnippet(snippet)
    setOpen(true)
  }

  const handleViewSnippet = (slug: string) => {
    router.push(`/snippets/${slug}`)
  }

  const handleCopySnippet = () => {
    if (selectedSnippet) {
      navigator.clipboard.writeText(selectedSnippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExecute = async () => {
    if (!selectedSnippet) return
    setOutput([])
    setIsRunning(true)

    const res = await fetch('/api/execute', {
      method: 'POST',
      body: JSON.stringify({ name: slugify(selectedSnippet?.title ?? '') }),
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
      <div className="grid grid-cols-1 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (snippets.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">No snippets found</h2>
        <p className="text-muted-foreground mb-6">
          Create your first code snippet to get started.
        </p>
        <Link href="/snippets/new">
          <Button>Create Snippet</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {snippets.map((snippet) => (
          <InlineLink
            key={snippet.id}
            onClick={() => handleOpenSnippet(snippet.slug)}
            className="text-left p-0"
          >
            <div className="flex flex-row items-center gap-4 justify-between w-full hover:text-muted-foreground">
              <Flex>
                <h2 className="text-xl mb-1 transition-colors">
                  {snippet.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {snippet.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(snippet.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </Flex>
              <Badge variant="outline" className="capitalize">
                {snippet.language}
              </Badge>
            </div>
          </InlineLink>
        ))}
      </div>

      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="min-w-[80vw] lg:min-w-[60vw] p-2 md:p-4 backdrop-blur-lg bg-white/80 dark:bg-zinc-900/60 border border-border shadow-xl">
          <DrawerHeader>
            <DrawerTitle className="text-3xl">
              {selectedSnippet?.title}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" className="absolute right-8 top-6">
                <XIcon strokeWidth={1.625} />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <Tabs defaultValue="code">
            {selectedSnippet && (
              <div className="px-4 space-y-4">
                {selectedSnippet.description && (
                  <p className="text-muted-foreground">
                    {selectedSnippet.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Badge className="capitalize">
                    {selectedSnippet.language}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created{' '}
                    {formatDistanceToNow(new Date(selectedSnippet.createdAt), {
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
                    <ButtonGroup>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopySnippet}
                      >
                        {copied ? (
                          <CheckIcon strokeWidth={1.625} />
                        ) : (
                          <CopyIcon strokeWidth={1.625} />
                        )}

                        {copied ? !isMobile && 'Copied' : !isMobile && 'Copy'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSnippet(selectedSnippet.slug)}
                      >
                        <ArrowUpRightFromSquareIcon strokeWidth={1.625} />
                        {!isMobile && 'Open'}
                      </Button>
                    </ButtonGroup>
                  </Flex>
                </Flex>

                <TabsContent value="code">
                  <ScrollArea className="h-[64vh] sm:h-[70vh] rounded-md no-scrollbar">
                    <Code
                      controls
                      title={selectedSnippet.title}
                      className="text-xs md:text-sm bg-(--color-zinc-100)/80 dark:bg-(--color-zinc-950)/80 w-[90ch] md:w-fit"
                    >
                      {selectedSnippet.code}
                    </Code>

                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="execute">
                  <div className="space-y-4">
                    <Button
                      onClick={handleExecute}
                      size="sm"
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <Loader2Icon
                          strokeWidth={1.625}
                          className="animate-spin"
                        />
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
        </DrawerContent>
      </Drawer>
    </>
  )
}
