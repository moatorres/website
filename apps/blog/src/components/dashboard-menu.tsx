'use client'

import { initials, lastSegment } from '@blog/utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn/ui'
import {
  BellIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOut,
  SettingsIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import config from '@/data/config.json'
import { deleteSession } from '@/lib/session'

import { useSession } from './context'
import { InlineLink } from './inline-link'

export function DashboardMenu() {
  const { setSession } = useSession()
  const router = useRouter()
  const githubPicture = config.githubUrl + '.png'
  const githubUsername = lastSegment(config.githubUrl)
  const authorInitials = initials(config.author)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Avatar className="size-8 rounded-md">
            <AvatarImage src={githubPicture} alt={githubUsername} />
            <AvatarFallback className="rounded-lg">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={githubPicture} alt={githubUsername} />
              <AvatarFallback className="rounded-lg">LR</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{githubUsername}</span>
              <span className="text-muted-foreground truncate text-xs">
                hello@moatorres.com
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <InlineLink href="/dashboard">
              <LayoutDashboardIcon />
              Dashboard{' '}
              <Badge variant="outline" className="px-1.5">
                NEW
              </Badge>
            </InlineLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <InlineLink href="/">
              <HomeIcon />
              Home
            </InlineLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <InlineLink href="/dashboard/settings">
              <SettingsIcon />
              Settings
            </InlineLink>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/"
            onClick={async () => {
              await deleteSession()
              setSession?.({ isAdmin: false, loggedIn: false })
              router.push('/')
            }}
          >
            <LogOut />
            Sign Out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
