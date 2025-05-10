'use client'

import {
  Button,
  buttonVariants,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@shadcn/ui'
import * as z from '@zod/mini'
import { VariantProps } from 'class-variance-authority'
import * as LucideReact from 'lucide-react'
import React from 'react'

type TabOption<T> = {
  value: keyof T
  label: string
}

type SelectOption<T> = {
  value: keyof T
  label: string
}

export type RenderConfig<T> = {
  key: keyof T
  render: (item: T) => React.ReactNode
}

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

type EntityTableProps<T extends object> = {
  entityName: string
  data: T[]
  schema?: z.ZodMiniType<T>
  tabs?: TabOption<T>[]
  bulkActions?: BulkAction<T>[]
  selectOptions?: keyof T | SelectOption<T>[]
  columns?: (keyof T)[]
  renderRowConfig?: RenderConfig<T>[]
}

const ITEMS_PER_PAGE = 10

export function createRenderConfig<T>(
  config: Partial<Record<keyof T, (item: T) => React.ReactNode>>
): RenderConfig<T>[] {
  return Object.entries(config).map(([key, render]) => ({
    key: key as keyof T,
    render: render as (item: T) => React.ReactNode,
  }))
}

function formatHeaderKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → camel Case
    .replace(/_/g, ' ') // snake_case → snake case
    .replace(/\b\w/g, (char) => char.toUpperCase()) // capitalize words
}

const defaultCellClass =
  'max-w-[360px] truncate overflow-hidden text-ellipsis whitespace-nowrap'

function safeDisplayValue(key: string, value: unknown): string {
  if (typeof value === 'string' && /At$/.test(key)) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

export function EntityTable<T extends Record<string, any>>({
  entityName,
  data,
  schema,
  tabs = [
    { value: 'published', label: 'Published' },
    { value: 'drafts', label: 'Drafts' },
  ],
  selectOptions,
  bulkActions = [],
  columns,
  renderRowConfig = [],
}: EntityTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedFilter, setSelectedFilter] = React.useState<string>('all')
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [view, setView] = React.useState<T | null>(null)

  // Validate with Zod if provided
  const safeData = React.useMemo(() => {
    if (schema) {
      const result = schema.safeParse(data)
      if (!result.success) return []
      return result.data
    }
    return data
  }, [data, schema])

  // Derive columns from first item
  const activeColumns =
    columns ?? (data.length > 0 ? (Object.keys(data[0]) as (keyof T)[]) : [])

  // Handle select options derivation
  const derivedSelectOptions = React.useMemo(() => {
    if (typeof selectOptions === 'string') {
      const key = selectOptions
      const uniqueValues = Array.from(
        new Set(data.map((d) => d[key]).filter(Boolean))
      )
      return [
        { value: 'all', label: 'All' },
        ...uniqueValues.map((val) => ({ value: val, label: val })),
      ]
    } else if (Array.isArray(selectOptions)) {
      return selectOptions
    }
    return []
  }, [selectOptions, data])

  // Apply filtering (if any)
  const filteredData = React.useMemo(() => {
    if (selectedFilter === 'all') return safeData
    if (typeof selectOptions === 'string') {
      return safeData.filter((d: T) => d[selectOptions] === selectedFilter)
    }
    return safeData
  }, [safeData, selectedFilter, selectOptions])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const renderConfigMap: Record<string, (item: T) => React.ReactNode> =
    React.useMemo(() => {
      return Object.fromEntries(
        renderRowConfig.map((r) => [r.key as string, r.render])
      )
    }, [renderRowConfig])

  const allVisibleIds = paginatedData.map((item: T) => item.id)
  const areAllSelected = allVisibleIds.every((id: string) =>
    selectedIds.has(id)
  )

  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds)
    if (areAllSelected) {
      allVisibleIds.forEach((id: string) => newSelected.delete(id))
    } else {
      allVisibleIds.forEach((id: string) => newSelected.add(id))
    }
    setSelectedIds(newSelected)
  }

  return (
    <>
      <div className="flex justify-between">
        {tabs.length > 0 && (
          <Tabs defaultValue={tabs[0].value as string}>
            <TabsList className="w-full @3xl/page:w-fit">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value as string}
                  value={tab.value as string}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <div className="flex flex-row space-x-2">
          {bulkActions.map((action, idx) => {
            const selectedItems = data.filter((d) => selectedIds.has(d.id))

            if (action.render) {
              return (
                <React.Fragment key={idx}>
                  {action.render(selectedItems)}
                </React.Fragment>
              )
            }

            const Icon = LucideReact[
              action.icon as keyof typeof LucideReact
            ] as React.JSX.ElementType

            return (
              <Button
                key={idx}
                size="sm"
                className={action.className}
                disabled={selectedIds.size < 1}
                variant={action.variant ?? 'outline'}
                onClick={() => action.onClick?.(selectedItems)}
              >
                {action.icon && <Icon />}
                {action.label && action.label}
              </Button>
            )
          })}
          {derivedSelectOptions.length > 0 && (
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger size="sm">
                <span className="text-muted-foreground text-sm">Filter:</span>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {derivedSelectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="max-w-[200px]">
            {view && (
              <Dialog open={true} onOpenChange={() => setView(null)}>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="capitalize">
                      {entityName} Metadata
                    </DialogTitle>
                    <DialogDescription>
                      ID: {view.id ?? 'Unknown'}
                    </DialogDescription>
                  </DialogHeader>
                  <pre className="max-h-[400px] overflow-auto rounded-md bg-muted p-4 text-sm">
                    {JSON.stringify(view, null, 2)}
                  </pre>
                  <DialogFooter>
                    <Button onClick={() => setView(null)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 px-4">
              <Checkbox
                checked={areAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            {activeColumns.map((col) => (
              <TableHead key={col as string}>
                {String(formatHeaderKey(col as string))}
              </TableHead>
            ))}
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item: T, idx: number) => (
            <TableRow key={idx}>
              <TableCell className="px-4">
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => {
                    const newSelected = new Set(selectedIds)
                    if (newSelected.has(item.id)) {
                      newSelected.delete(item.id)
                    } else {
                      newSelected.add(item.id)
                    }
                    setSelectedIds(newSelected)
                  }}
                />
              </TableCell>
              {activeColumns.map((col) => (
                <TableCell key={col as string} className={defaultCellClass}>
                  {typeof renderConfigMap[col as string] === 'function'
                    ? renderConfigMap[col as string](item)
                    : typeof item[col] === 'object'
                      ? JSON.stringify(item[col]) // fallback for objects/arrays
                      : safeDisplayValue(col as string, item[col])}
                </TableCell>
              ))}
              <TableCell />
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-6">
                      <LucideReact.EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setView(item)}>
                      <LucideReact.EyeIcon />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LucideReact.EditIcon />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <LucideReact.Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col curso items-center justify-between @3xl/page:flex-row px-4">
        <div className="text-muted-foreground hidden text-sm @3xl/page:block">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{' '}
          {filteredData.length} {entityName.toLowerCase()}
        </div>
        <Pagination className="mx-0 w-fit">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(currentPage - 1)
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(i + 1)
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {totalPages > 3 && currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(currentPage + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  )
}
