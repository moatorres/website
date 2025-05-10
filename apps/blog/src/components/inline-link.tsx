/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { cn } from '@shadcn/ui'
import type { LinkProps } from 'next/link'
import Link from 'next/link'
import { ReactNode } from 'react'

type InlineLinkProps = Omit<LinkProps, 'href'> & {
  href?: string
  children?: ReactNode
  className?: string
  underline?: boolean
  bold?: boolean
}

export function InlineLink({
  children,
  className,
  href = '#',
  underline = false,
  bold = false,
  ...props
}: InlineLinkProps) {
  const baseClassName = cn(
    'relative inline-block text-foreground',
    underline &&
      'after:absolute after:left-0 after:bottom-1 after:h-[1px] after:w-full after:bg-accent-foreground after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100',
    bold && 'font-medium',
    className
  )

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={baseClassName} {...props}>
        {children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} className={baseClassName} {...props}>
        {children}
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClassName}
      {...props}
    >
      {children}
    </a>
  )
}
