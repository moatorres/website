/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { Badge } from '@shadcn/ui'
import { BanIcon, CheckCircle2Icon, CheckIcon, LoaderIcon } from 'lucide-react'

export const PublishBadge1 = ({ published }: { published?: boolean }) => {
  return (
    <Badge variant="outline" className="text-muted-foreground px-1.5">
      {published ? (
        <CheckCircle2Icon className="fill-green-500 dark:fill-green-400 stroke-background" />
      ) : (
        <LoaderIcon />
      )}
      {published ? 'Published' : 'Draft'}
    </Badge>
  )
}

export const PublishBadge2 = ({ published }: { published?: boolean }) => {
  return (
    <Badge
      variant="secondary"
      className={
        published
          ? 'bg-green-200 text-green-700 dark:border-green-500 dark:bg-green-950 dark:text-green-500'
          : 'bg-zinc-200 text-zinc-800 dark:border-zinc-500 dark:bg-zinc-950 dark:text-zinc-400'
      }
    >
      {published ? <CheckIcon /> : <BanIcon />}
      {published ? 'Published' : 'Draft'}
    </Badge>
  )
}

// TODO: Add language-specific icons (e.g. TS, Go, etc.)
export function LanguageBadge(props: { language: 'go' | 'typescript' }) {
  if (props.language.toLowerCase().includes('go')) {
    return (
      <Badge
        variant="secondary"
        className="capitalize border-cyan-700 bg-transparent text-cyan-700 dark:border-cyan-500 dark:bg-cyan-950 dark:text-cyan-500"
      >
        {props.language}
      </Badge>
    )
  }

  if (props.language.toLowerCase().includes('typescript')) {
    return (
      <Badge
        variant="secondary"
        className="capitalize border-blue-700 bg-transparent text-blue-800 dark:bg-blue-950 dark:text-blue-300"
      >
        {props.language}
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className="border-zinc-700 bg-transparent text-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
    >
      Unknown
    </Badge>
  )
}
