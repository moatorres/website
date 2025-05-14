/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import React from 'react'
import { toast } from 'sonner'

import { LanguageBadge, PublishBadge1 } from '@/components/badges'
import { BulkAction } from '@/components/bulk-actions'
import { createRenderConfig, EntityTable } from '@/components/entity-table'

export type Snippet = {
  id: string
  title: string
  language: 'go' | 'typescript'
  published: boolean
  createdAt: string
}

export function SnippetsTable({ data }: { data: Snippet[] }) {
  const [quotes] = React.useState(data)

  const handleLog = React.useCallback((selected: Snippet[]) => {
    return toast(
      selected.map((q) => q.language),
      {
        description: selected.map((q) => q.title),
        action: {
          label: 'Save',
          onClick: () => alert(`Saved: ${selected.map((q) => q.id)}`),
        },
      }
    )
  }, [])

  const handleDelete = React.useCallback((selected: Snippet[]) => {
    console.log('Deleting:', selected)
  }, [])

  const bulkActions = React.useMemo<BulkAction<Snippet>[]>(
    () => [
      {
        label: 'Log',
        icon: 'LogsIcon',
        onClick: handleLog,
      },
      {
        label: 'Edit',
        icon: 'Edit2Icon',
        onClick: (posts) => console.log('Editing:', posts),
      },
      {
        label: 'Delete',
        icon: 'TrashIcon',
        onClick: handleDelete,
      },
    ],
    [handleDelete, handleLog]
  )

  const renderLanguage = React.useCallback(
    ({ language }: Snippet) => <LanguageBadge language={language} />,
    []
  )
  const renderPublished = React.useCallback(
    ({ published }: Snippet) => <PublishBadge1 published={published} />,
    []
  )

  const renderRowConfig = React.useMemo(
    () =>
      createRenderConfig<Snippet>({
        language: renderLanguage,
        published: renderPublished,
      }),
    [renderLanguage, renderPublished]
  )

  return (
    <EntityTable<Snippet>
      entityName="Snippets"
      data={quotes}
      columns={['title', 'language', 'published']}
      selectOptions="language"
      bulkActions={bulkActions}
      renderRowConfig={renderRowConfig}
    />
  )
}
