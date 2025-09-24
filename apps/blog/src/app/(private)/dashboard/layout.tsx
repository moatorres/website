import { SidebarInset, SidebarProvider } from '@shadcn/ui'
import { cookies } from 'next/headers'
import React from 'react'

import { SiteHeader } from '@/components/dashboard/site-header'
import { AppSidebar } from '@/components/layout/app-sidebar'

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
