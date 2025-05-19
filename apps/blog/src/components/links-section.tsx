import { cn } from '@shadcn/ui'
import { ExternalLinkIcon } from 'lucide-react'
import React from 'react'

import config from '@/data/config.json'

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
    fontMedium: true,
  },
  {
    label: 'TypeTags',
    url: 'https://typetags.org/',
    prefix: 'Creator of',
    icon: 'external',
    fontMedium: true,
  },
  {
    label: 'Codyslexia',
    url: 'https://github.com/codyslexia',
    prefix: 'Core team member of',
    icon: 'external',
    fontMedium: true,
  },
]

const icons: Record<string, React.JSX.Element> = {
  external: <ExternalLinkIcon className="inline" size={16} />,
}

export function LinksSection() {
  return links.map((item, index) => (
    <span key={index} className="block">
      {item.prefix && <span>{item.prefix} </span>}
      <InlineLink
        href={item.url}
        underline={item.underline}
        className={cn(`${item.fontMedium ? 'font-medium' : ''}`)}
      >
        {item.label}
        {item?.icon && ' '}
        {icons[item?.icon as keyof typeof icons]}
      </InlineLink>
      {item.suffix && <span> {item.suffix}</span>}
    </span>
  ))
}
