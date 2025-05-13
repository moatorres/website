/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shadcn/ui'
import {
  CodeIcon,
  DownloadIcon,
  FileImageIcon,
  FileTextIcon,
  FilterIcon,
  QuoteIcon,
} from 'lucide-react'
import { Metadata } from 'next'

import { AnalyticsDatePicker } from '@/components/analytics-date-picker'
import { ChartRevenue } from '@/components/chart-revenue'
import { ChartVisitors } from '@/components/chart-visitors'

const sectionCards = [
  {
    title: 'Total snippets',
    total: 24,
    latest: '+2 from last week',
    icon: CodeIcon,
  },
  {
    title: 'Blog posts',
    total: 12,
    latest: '+3 from last month',
    icon: FileTextIcon,
  },
  {
    title: 'Photos',
    total: 36,
    latest: '+5 from last week',
    icon: FileImageIcon,
  },
  {
    title: 'Quotes',
    total: 18,
    latest: '+2 new quotes',
    icon: QuoteIcon,
  },
]

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'An example dashboard to test the new components.',
}

export default function DashboardPage() {
  return (
    <div className="@container/page flex flex-1 flex-col gap-8 p-6">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Tabs defaultValue="overview" className="gap-6">
          <div
            data-slot="dashboard-header"
            className="flex items-center justify-between"
          >
            <TabsList className="w-full @3xl/page:w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="exports" disabled>
                Exports
              </TabsTrigger>
            </TabsList>
            <div className="hidden items-center gap-2 @3xl/page:flex">
              <AnalyticsDatePicker />
              <Button variant="outline">
                <FilterIcon />
                Filter
              </Button>
              <Button variant="outline">
                <DownloadIcon />
                Export
              </Button>
            </div>
          </div>
          <TabsContent value="overview" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sectionCards.map((section, idx) => {
                const Icon = section.icon
                return (
                  idx < 4 && (
                    <Card key={idx}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="capitalize">
                          {section.title}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {section.total}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {section.latest}
                        </p>
                      </CardContent>
                    </Card>
                  )
                )
              })}
            </div>
            <div className="grid grid-cols-1 gap-4 @4xl/page:grid-cols-[2fr_1fr]">
              <ChartRevenue />
              <ChartVisitors />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
