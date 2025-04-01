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
        <div className="text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} {config.author}
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
