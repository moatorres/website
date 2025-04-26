/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import config from '@/data/config.json'

const links = [
  { name: 'LinkedIn', url: config.linkedinUrl },
  { name: 'GitHub', url: config.githubUrl },
]

export function Footer() {
  return (
    <footer className="px-4 md:px-6 py-12 text-muted-foreground">
      <div className="flex md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col md:flex-row gap-2 text-xs uppercase tracking-widest">
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
          >
            CC BY-NC-SA 4.0
          </a>
          <span>
            {new Date().getFullYear()}–Present © {config.author}
          </span>
        </div>
        <nav className="flex gap-6">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-widest hover:text-muted-foreground"
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
