/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { Badge } from '@shadcn/ui'
import React from 'react'
import { toast } from 'sonner'

import {
  BulkAction,
  createRenderConfig,
  EntityTable,
} from '@/components/entity-table'
import { InlineLink } from '@/components/inline-link'
import { ArticleMetadata } from '@/lib/articles'

export function PostsTable({ data }: { data: ArticleMetadata[] }) {
  const [articles] = React.useState(data)

  const handleLog = React.useCallback((selected: ArticleMetadata[]) => {
    return toast('Logging', {
      description: selected.map((article) => article.title),
      action: {
        label: 'Log',
        onClick: () => alert(JSON.stringify(selected, null, 2)),
      },
    })
  }, [])

  const handleDelete = React.useCallback((selected: ArticleMetadata[]) => {
    console.log('Deleting:', selected)
  }, [])

  const bulkActions = React.useMemo<BulkAction<ArticleMetadata>[]>(
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

  const renderAuthor = React.useCallback(
    (item: ArticleMetadata) => <Badge variant="outline">{item.author}</Badge>,
    []
  )

  const renderTitle = React.useCallback(
    (item: ArticleMetadata) => (
      <InlineLink
        href={item.href}
        className="hover:text-primary transition-colors duration-150"
      >
        {item.title}
      </InlineLink>
    ),
    []
  )

  const renderFilePath = React.useCallback(
    (item: ArticleMetadata) => (
      <Badge variant="secondary" className="font-mono">
        {item.filePath}
      </Badge>
    ),
    []
  )

  const renderCollection = React.useCallback(
    (item: ArticleMetadata) => (
      <span className="capitalize">{item.collection}</span>
    ),
    []
  )

  const renderRowConfig = React.useMemo(
    () =>
      createRenderConfig<ArticleMetadata>({
        title: renderTitle,
        collection: renderCollection,
        author: renderAuthor,
        filePath: renderFilePath,
      }),
    [renderAuthor, renderCollection, renderFilePath, renderTitle]
  )

  return (
    <EntityTable
      entityName="Posts"
      data={articles}
      columns={['title', 'collection', 'author']}
      selectOptions="category"
      bulkActions={bulkActions}
      renderRowConfig={renderRowConfig}
    />
  )
}
