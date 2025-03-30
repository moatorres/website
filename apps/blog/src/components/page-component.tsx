/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

interface PageProps {
  children?: React.ReactNode
  className?: string
}

export function Page({ children }: PageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-[60ch] mx-auto">
      {children}
    </div>
  )
}
