import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn/ui'
import React, { Suspense } from 'react'

import { Page, PageHeading } from '@/components/page'

import BookmarkGrid from './components/grid'

export default function BookmarksPage() {
  return (
    <>
      <Tabs defaultValue="all">
        <Page className="min-h-fit">
          <PageHeading>Bookmarks</PageHeading>

          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>
        </Page>

        <TabsContent value="all" className="mt-6">
          <Suspense fallback={<BookmarkGridSkeleton />}>
            <BookmarkGrid filter="all" />
          </Suspense>
        </TabsContent>

        <TabsContent value="websites" className="mt-6">
          <Suspense fallback={<BookmarkGridSkeleton />}>
            <BookmarkGrid filter="website" />
          </Suspense>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <Suspense fallback={<BookmarkGridSkeleton />}>
            <BookmarkGrid filter="image" />
          </Suspense>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <Suspense fallback={<BookmarkGridSkeleton />}>
            <BookmarkGrid filter="video" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  )
}

function BookmarkGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
