import { cn } from '@shadcn/ui'

type SkeletonProps = React.ComponentProps<'div'>

type Lines = {
  lines?: number
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className={cn('rounded-md bg-muted h-5 w-full', className)} />
    </div>
  )
}

export function ImageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="my-6 space-y-2">
        <div className="aspect-video w-full rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-2/3 rounded-md bg-muted" />
      </div>
    </div>
  )
}

export function TextSkeleton({ className, lines = 3 }: SkeletonProps & Lines) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={`text-${i}`}
            className="h-4 rounded-md bg-muted"
            style={{ width: i === lines - 1 ? '70%' : '100%' }}
          />
        ))}
      </div>
    </div>
  )
}

export function CodeSkeleton({ className, lines = 3 }: SkeletonProps & Lines) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="my-6 rounded-lg border border-border">
        {/* CodeSkeleton Header */}
        <div className="border-b border-border rounded-t bg-muted-foreground px-4 py-2 dark:bg-zinc-900">
          <div className="h-4 w-1/3 rounded-md bg-muted" />
        </div>
        {/* CodeSkeleton Body */}
        <div className="bg-muted p-4 rounded-b">
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={`code-${i}`}
                className="h-4 rounded-md bg-muted-foreground/30"
                style={{
                  width: `${Math.floor(Math.random() * 50) + 50}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArticleSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {/* Heading Skeleton */}
      <div className="mb-2 h-8 w-3/4 rounded-md bg-muted" />
      <div className="mb-8 h-4 w-1/2 rounded-md bg-muted" />

      {/* Content Skeleton - mix of paragraphs and other elements */}
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={`p-${i}`} className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={`l-${i}-${j}`}
                className="h-4 rounded-md bg-muted"
                style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
              />
            ))}
          </div>
        ))}

        {/* Code Block Skeleton */}
        <CodeSkeleton />

        {/* More paragraphs */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`p2-${i}`}
              className="h-4 rounded-md bg-muted"
              style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
