'use client'

import React from 'react'
import { toast } from 'sonner'

import { LanguageBadge } from '@/components/badges'
import { BulkAction } from '@/components/bulk-actions'
import { createRenderConfig, EntityTable } from '@/components/entity-table'
import { Snippet } from '@/lib/snippets'

export function SnippetsTable({ data }: { data: Snippet[] }) {
  const [snippets] = React.useState(data)

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

  const renderRowConfig = React.useMemo(
    () =>
      createRenderConfig<Snippet>({
        language: renderLanguage,
      }),
    [renderLanguage]
  )

  return (
    <EntityTable
      entityName="Snippets"
      data={snippets}
      columns={['title', 'language', 'createdAt']}
      selectOptions="language"
      bulkActions={bulkActions}
      renderRowConfig={renderRowConfig}
    />
  )
}
