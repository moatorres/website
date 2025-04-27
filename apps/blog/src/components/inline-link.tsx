/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import Link from 'next/link'
import { PropsWithChildren } from 'react'

import { cx } from '@/utils/cx'

export function InlineLink({
  children,
  className,
  href = '#',
  underline = false,
  ...props
}: PropsWithChildren<{
  href?: string
  className?: string
  underline?: boolean
}>) {
  const baseClassName = cx(
    'relative inline-block text-accent-foreground',
    underline &&
      'after:absolute after:left-0 after:bottom-1 after:h-[1px] after:w-full after:bg-accent-foreground after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100',
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
