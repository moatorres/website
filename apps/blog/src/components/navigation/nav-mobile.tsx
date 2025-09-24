'use client'

import { Button, cn, Drawer, DrawerContent, DrawerTrigger } from '@shadcn/ui'
import { Code2Icon, Icon, MenuIcon, XIcon } from 'lucide-react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

import { useSession } from '@/components/context/session'
import { useMetaColor } from '@/components/hooks/use-meta-color'
import { Box } from '@/components/ui/box'
import { Flex } from '@/components/ui/flex'

type Link = {
  title: string
  href: `/${string}`
  icon?: typeof Icon
  label?: string
  private?: boolean
}

type LinkGroup = {
  group: string
  items: Link[]
}

const links: LinkGroup[] = [
  {
    group: 'moatorres.co',
    items: [
      {
        href: '/blog',
        title: 'articles',
        private: false,
      },
      {
        href: '/photos',
        title: 'photos',
        private: false,
      },
      {
        href: '/quotes',
        title: 'quotes',
        private: false,
      },
      {
        href: '/snippets',
        title: 'snippets',
        private: false,
      },
    ],
  },
  {
    group: 'dashboard',
    items: [
      {
        href: '/dashboard/posts',
        title: 'posts',
        private: true,
      },
      {
        href: '/dashboard/quotes',
        title: 'quotes',
        private: true,
      },
      {
        href: '/dashboard/snippets',
        title: 'snippets',
        label: 'new',
        private: true,
      },
    ],
  },
]

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { setMetaColor, metaColor } = useMetaColor()
  const { isAdmin } = useSession()

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    setMetaColor(open ? '#09090b' : metaColor)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="left">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 gap-4 px-0 text-base text-muted-foreground hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {open ? (
            <XIcon strokeWidth={1.625} />
          ) : (
            <MenuIcon strokeWidth={1.625} />
          )}
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="p-0">
        <Box className="overflow-auto p-6">
          <Flex className="gap-2">
            <h1>
              <Code2Icon />
            </h1>
            {links.map((section, index) => {
              const visibleItems = section.items.filter(
                (item) => !item.private || isAdmin
              )

              if (visibleItems.length === 0) return null

              return (
                <Flex key={index} className="pt-6 gap-2">
                  <h4 className="text-xl font-medium">{section.group}</h4>
                  {visibleItems.map((item) => (
                    <MobileLink
                      key={item.href}
                      href={item.href}
                      onOpenChange={setOpen}
                      className="opacity-80"
                    >
                      {item.title}
                      {item.label && (
                        <span className="ml-2 rounded-md bg-lime-400 px-1.5 py-0.5 text-xs leading-none text-black">
                          {item.label}
                        </span>
                      )}
                    </MobileLink>
                  ))}
                </Flex>
              )
            })}
          </Flex>
        </Box>
        {!isAdmin && (
          <Flex className="mt-auto p-6 justify-around">
            <MobileLink
              href="/login"
              onOpenChange={setOpen}
              className="text-muted-foreground flex items-center gap-2"
            >
              login
            </MobileLink>
          </Flex>
        )}
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
        'text-[1.15rem] transition-all ease-in-out duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
