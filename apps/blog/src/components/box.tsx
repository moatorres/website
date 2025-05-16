import { cn } from '@shadcn/ui'
import * as React from 'react'

type BoxProps = React.HTMLAttributes<HTMLDivElement>

export function Box({ className, ...props }: BoxProps) {
  return <div className={cn(className)} {...props} />
}
