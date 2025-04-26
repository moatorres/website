/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'

import { CodeBlock } from './components/code-block'

export function useMDXComponents(): MDXComponents {
  return {
    h1: (props: ComponentPropsWithoutRef<'h1'>) => (
      <h1
        className="not-prose text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6 text-[var(--tw-prose-headings)]"
        {...props}
      />
    ),
    h2: (props: ComponentPropsWithoutRef<'h2'>) => (
      <h2
        className="not-prose text-2xl font-bold mt-12 mb-4 not-prose text-[var(--tw-prose-headings)]"
        {...props}
      />
    ),
    h3: (props: ComponentPropsWithoutRef<'h3'>) => (
      <h3
        className="not-prose font-semibold mt-8 mb-3 text-[var(--tw-prose-headings)]"
        {...props}
      />
    ),
    h4: (props: ComponentPropsWithoutRef<'h4'>) => (
      <h4
        className="not-prose font-semibold mt-6 mb-3 text-[var(--tw-prose-headings)]"
        {...props}
      />
    ),
    h5: (props: ComponentPropsWithoutRef<'h5'>) => (
      <div
        className="not-prose text-xs uppercase tracking-widest text-muted-foreground my-1"
        {...props}
      />
    ),
    h6: (props: ComponentPropsWithoutRef<'h6'>) => (
      <p className="not-prose text-sm text-muted-foreground my-1" {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<'p'>) => (
      <p className="leading-relaxed mb-8" {...props} />
    ),
    ol: (props: ComponentPropsWithoutRef<'ol'>) => (
      <ol className="list-decimal pl-5 space-y-2" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<'ul'>) => (
      <ul className="list-disc pl-5 space-y-1" {...props} />
    ),
    li: (props: ComponentPropsWithoutRef<'li'>) => (
      <li className="pl-1" {...props} />
    ),
    em: (props: ComponentPropsWithoutRef<'em'>) => (
      <em className="font-medium" {...props} />
    ),
    strong: (props: ComponentPropsWithoutRef<'strong'>) => (
      <strong className="font-medium" {...props} />
    ),
    a: ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
      const className =
        'text-gray-600 hover:text-gray-800 dark:text-gray-300 hover:dark:text-gray-400 dark:underline dark:underline-offset-2 dark:decoration-gray-300 hover:dark:decoration-gray-400 underline underline-offset-2 transition-all duration-50'

      if (href?.startsWith('/')) {
        return (
          <Link href={href} className={className} {...props}>
            {children}
          </Link>
        )
      }
      if (href?.startsWith('#')) {
        return (
          <a href={href} className={className} {...props}>
            {children}
          </a>
        )
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          {...props}
        >
          {children}
        </a>
      )
    },
    code: CodeBlock,
    Table: ({ data }: { data: { headers: string[]; rows: string[][] } }) => (
      <table>
        <thead>
          <tr>
            {data.headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ),
    blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote
        className="ml-[0.075em] border-l-3 border-gray-300 pl-4 text-gray-600 dark:border-zinc-600 dark:text-zinc-300 tracking-wide"
        {...props}
      />
    ),
  }
}
