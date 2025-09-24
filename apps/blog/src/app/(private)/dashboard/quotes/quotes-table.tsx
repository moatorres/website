'use client'

import { Badge } from '@shadcn/ui'
import React from 'react'
import { toast } from 'sonner'

import { BulkAction } from '@/components/dashboard/bulk-actions'
import {
  createRenderConfig,
  EntityTable,
} from '@/components/dashboard/entity-table'
import { Quote } from '@/lib/quotes'

export function QuotesTable({ data }: { data: Quote[] }) {
  const [quotes] = React.useState(data)

  const handleLog = React.useCallback((selected: Quote[]) => {
    return toast(
      selected.map((q) => q.author),
      {
        description: selected.map((q) => q.text),
        action: {
          label: 'Save',
          onClick: () => alert(`Saved: ${selected.map((q) => q.id)}`),
        },
      }
    )
  }, [])

  const handleDelete = React.useCallback((selected: Quote[]) => {
    console.log('Deleting:', selected)
  }, [])

  const bulkActions = React.useMemo<BulkAction<Quote>[]>(
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

  const renderId = React.useCallback(
    ({ id }: Quote) => (
      <Badge variant="outline" className="text-xs font-mono bg-zinc-500/30">
        {id}
      </Badge>
    ),
    []
  )
  const renderCategory = React.useCallback(
    ({ category }: Quote) => <Badge>{category}</Badge>,
    []
  )

  return (
    <EntityTable
      entityName="Quotes"
      data={quotes}
      selectOptions="category"
      columns={['text', 'author', 'category']}
      bulkActions={bulkActions}
      renderRowConfig={React.useMemo(
        () =>
          createRenderConfig<Quote>({
            id: renderId,
            category: renderCategory,
          }),
        [renderId, renderCategory]
      )}
    />
  )
}
