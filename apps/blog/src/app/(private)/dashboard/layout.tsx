/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { SidebarInset, SidebarProvider } from '@shadcn/ui'
import { cookies } from 'next/headers'
import React from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'

import './theme.css'

export default async function DashboardLayout({
  children,
}: React.PropsWithChildren) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
