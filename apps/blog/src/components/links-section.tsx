/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { ExternalLinkIcon } from 'lucide-react'
import { JSX } from 'react'

import config from '@/data/config.json'
import { cx } from '@/utils/cx'

import { InlineLink } from './inline-link'

type LinkItem = {
  label: string
  url: string
  prefix?: string
  suffix?: string
  underline?: boolean
  fontMedium?: boolean
  icon?: 'external'
}

const links: LinkItem[] = [
  {
    label: 'Available',
    url: config.linkedinUrl,
    suffix: 'for work.',
    underline: true,
  },
  {
    label: 'TypeTags',
    url: 'https://typetags.org/',
    prefix: 'Creator of',
    icon: 'external',
  },
  {
    label: 'Codyslexia',
    url: 'https://github.com/codyslexia',
    prefix: 'Core team member of',
    icon: 'external',
  },
]

const icons: Record<string, JSX.Element> = {
  external: <ExternalLinkIcon className="inline" size={16} />,
}

export function LinksSection() {
  return (
    <div>
      {links.map((item, index) => (
        <div key={index}>
          {item.prefix && <span>{item.prefix} </span>}
          <InlineLink
            href={item.url}
            underline={item.underline}
            className={cx(`
              ${item.fontMedium ? 'font-medium' : ''}
            `)}
          >
            {item.label}
            {item?.icon && ' '}
            {icons[item?.icon as keyof typeof icons]}
          </InlineLink>
          {item.suffix && <span> {item.suffix}</span>}
        </div>
      ))}
    </div>
  )
}
