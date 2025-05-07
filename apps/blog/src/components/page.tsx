/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { cx } from '@blog/ui'

export const PAGE_LAYOUT = 'max-w-[70ch] print:max-w-[80ch] mx-auto'

export function Page({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <main
      className={cx(
        'min-h-screen bg-background text-foreground flex flex-col',
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
    <section className={cx('flex-1 px-4 md:px-6 py-10 md:py-14', className)}>
      {children}
    </section>
  )
}

export function PageHeading({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <h1 className={cx('text-3xl md:text-4xl font-medium mb-6', className)}>
      {children}
    </h1>
  )
}
