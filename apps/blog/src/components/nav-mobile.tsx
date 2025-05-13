/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { Button, cn, Drawer, DrawerContent, DrawerTrigger } from '@shadcn/ui'
import {
  BookmarkIcon,
  CameraIcon,
  CodeIcon,
  FileTextIcon,
  GitCompareArrowsIcon,
  LogInIcon,
  MenuIcon,
  MicIcon,
  QuoteIcon,
  XIcon,
} from 'lucide-react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { useSession } from './context'
import { useMetaColor } from './use-meta-color'

const links = {
  public: [
    { href: '/blog', title: 'blog', icon: FileTextIcon },
    { href: '/bookmarks', title: 'bookmarks', icon: BookmarkIcon },
    { href: '/login', title: 'login', icon: LogInIcon },
    { href: '/photos', title: 'photos', icon: CameraIcon },
    { href: '/projects', title: 'projects', icon: GitCompareArrowsIcon },
    { href: '/quotes', title: 'quotes', icon: QuoteIcon },
    { href: '/snippets', title: 'snippets', icon: CodeIcon },
    { href: '/talks', title: 'talks', icon: MicIcon },
  ],
  private: [
    {
      title: 'dashboard',
      items: [
        {
          href: '/dashboard/posts',
          title: 'posts',
          disabled: false,
        },
        {
          href: '/dashboard/quotes',
          title: 'quotes',
          disabled: false,
          label: 'v1',
        },
        {
          href: '/dashboard/snippets',
          title: 'snippets',
          disabled: false,
          label: 'v2.x',
        },
      ],
    },
  ],
}
export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { setMetaColor, metaColor } = useMetaColor()
  const { isAdmin } = useSession()

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      setOpen(open)
      setMetaColor(open ? '#09090b' : metaColor)
    },
    [setMetaColor, metaColor]
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 gap-4 px-0 text-base text-muted-foreground hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          {open ? (
            <XIcon strokeWidth={1.625} />
          ) : (
            <MenuIcon strokeWidth={1.625} />
          )}
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[80svh] p-0">
        <div className="overflow-auto p-6">
          <div className="flex flex-col space-y-3">
            {links.public.map(
              (item) =>
                item.href && (
                  <MobileLink
                    key={item.href}
                    href={item.href}
                    onOpenChange={setOpen}
                    className="flex flex-row gap-3 items-center"
                  >
                    {/* {item.icon && <item.icon strokeWidth={1.625} />}{' '} */}
                    {item.title}
                  </MobileLink>
                )
            )}
          </div>
          <div className="flex flex-col space-y-2">
            {isAdmin &&
              links.private.map((item, index) => (
                <div key={index} className="flex flex-col gap-4 pt-6">
                  <h4 className="text-xl font-medium">{item.title}</h4>
                  {item?.items?.length &&
                    item.items.map((item) => (
                      <React.Fragment key={item.href}>
                        {!item.disabled &&
                          (item.href ? (
                            <MobileLink
                              href={item.href}
                              className="opacity-80"
                              onOpenChange={setOpen}
                            >
                              {item.title}
                              {item.label && (
                                <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                                  {item.label}
                                </span>
                              )}
                            </MobileLink>
                          ) : (
                            item.title
                          ))}
                      </React.Fragment>
                    ))}
                </div>
              ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={cn(
        'text-[1.15rem] transition-all ease-initial duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
