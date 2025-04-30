/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

export function Page({
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col max-w-[70ch] print:max-w-[80ch] mx-auto">
      {children}
    </main>
  )
}

export function PageSection({ children }: React.PropsWithChildren) {
  return (
    <section className="flex-1 px-4 md:px-6 py-12 md:py-16">{children}</section>
  )
}

export function PageHeading({ children }: React.PropsWithChildren) {
  return <h1 className="text-2xl md:text-3xl font-medium mb-6">{children}</h1>
}
