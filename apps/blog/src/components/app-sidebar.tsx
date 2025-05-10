'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shadcn/ui'
import {
  AlignCenterIcon,
  BookmarkIcon,
  ChartPieIcon,
  CodeIcon,
  CpuIcon,
  DatabaseIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  QuoteIcon,
  SettingsIcon,
  TextCursorIcon,
} from 'lucide-react'
import * as React from 'react'

import { InlineLink } from '@/components/inline-link'

import { NavDocuments } from './nav-documents'
import { NavMain } from './nav-main'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'

const navigation = {
  user: {
    name: 'moatorres',
    email: 'hello@moatorres.com',
    avatar: 'https://github.com/moatorres.png',
  },
  main: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: ChartPieIcon,
    },
    {
      title: 'Database',
      url: '#',
      icon: DatabaseIcon,
    },
  ],
  documents: [
    {
      name: 'Bookmarks',
      url: '#',
      icon: BookmarkIcon,
    },
    {
      name: 'Hardware',
      url: '#',
      icon: CpuIcon,
    },
    {
      name: 'Posts',
      url: '/dashboard/posts',
      icon: TextCursorIcon,
    },
    {
      name: 'Projects',
      url: '#',
      icon: FileTextIcon,
    },
    {
      name: 'Quotes',
      url: '/dashboard/quotes',
      icon: QuoteIcon,
    },
    {
      name: 'Snippets',
      url: '/dashboard/snippets',
      icon: CodeIcon,
    },
  ],
  footer: [
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: SettingsIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <InlineLink href="/">
                <AlignCenterIcon className="!size-5" />
                <span className="text-base font-semibold">Blog X.</span>
              </InlineLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation.main} />
        <NavDocuments items={navigation.documents} />
        <NavSecondary items={navigation.footer} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navigation.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
