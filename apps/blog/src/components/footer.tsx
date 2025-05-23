import { cn } from '@shadcn/ui'

import config from '@/data/config.json'

const links = [
  { name: 'LinkedIn', url: config.linkedinUrl },
  { name: 'GitHub', url: config.githubUrl },
]

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn('py-6 px-8 text-muted-foreground print:hidden', className)}
    >
      <div className="flex md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-2 text-xs uppercase tracking-widest">
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
          >
            CC BY-NC-SA 4.0
          </a>
          <span className="hidden sm:flex">
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
