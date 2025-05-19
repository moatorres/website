import { cn } from '@shadcn/ui'

export const PAGE_LAYOUT = 'max-w-[70ch] print:max-w-[80ch]'

export function Page({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <main
      className={cn(
        'flex flex-col min-h-[79.25vh] w-full mx-auto',
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
    <section className={cn('flex-1 px-8 py-12', className)}>{children}</section>
  )
}

export function PageHeading({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <h1 className={cn('text-4xl md:text-4xl font-medium mb-6', className)}>
      {children}
    </h1>
  )
}
