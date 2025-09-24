import type { MDXComponents } from 'mdx/types'
import { ComponentPropsWithoutRef } from 'react'

import { CodeBlock } from './components/ui/code-block'
import { InlineLink } from './components/ui/inline-link'

export function useMDXComponents(): MDXComponents {
  return {
    p: (props: ComponentPropsWithoutRef<'p'>) => (
      <p className="leading-relaxed mb-8 prose-p:text-foreground" {...props} />
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
    a: (props: ComponentPropsWithoutRef<'a'>) => (
      <InlineLink underline {...props} />
    ),
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
        className="border-l-3 border-muted-foreground font-normal pl-4 ml-[0.075em]"
        {...props}
      />
    ),
  }
}
