/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { buttonVariants } from '@shadcn/ui'
import { VariantProps } from 'class-variance-authority'
import * as LucideReact from 'lucide-react'

export type BulkActionBase = {
  label?: string
  icon?: keyof typeof LucideReact
  variant?: VariantProps<typeof buttonVariants>['variant']
  className?: string
}

export type BulkActionWithClick<T> = BulkActionBase & {
  onClick: (selected: T[]) => void
  render?: never
}

export type BulkActionWithRender<T> = BulkActionBase & {
  render: (selected: T[]) => React.ReactNode
  onClick?: never
}

export type BulkAction<T> = BulkActionWithClick<T> | BulkActionWithRender<T>
