/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { cn } from '@shadcn/ui'

export const PAGE_LAYOUT = 'max-w-[70ch] print:max-w-[80ch]'

export function Page({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <main
      className={cn(
        'min-h-screen w-full mx-auto bg-background text-foreground flex flex-col',
        PAGE_LAYOUT,
        className
      )}
    >
      {children}
    </main>
  )
}

export function PageSection({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section className={cn('flex-1 px-4 md:px-6 py-6 md:py-12', className)}>
      {children}
    </section>
  )
}

export function PageHeading({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <h1 className={cn('text-3xl md:text-4xl font-medium mb-6', className)}>
      {children}
    </h1>
  )
}
