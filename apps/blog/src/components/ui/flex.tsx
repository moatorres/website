import { cn } from '@shadcn/ui'
import * as React from 'react'

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col'
  wrap?: boolean
}

export function Flex({
  direction = 'col',
  wrap = false,
  className,
  ...props
}: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    />
  )
}
