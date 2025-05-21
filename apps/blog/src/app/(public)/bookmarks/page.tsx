/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import {
  // Button,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shadcn/ui'
// import Link from 'next/link'
import React, { Suspense } from 'react'

// import { UnfurlPreview } from '@/components/fur'
// import { DiscordIcon } from '@/components/icons'
// import { InlineLink } from '@/components/inline-link'
import { Page, PageHeading, PageSection } from '@/components/page'

// import { Page, PAGE_LAYOUT, PageHeading, PageSection } from '@/components/page'
// import AddBookmarkForm from './components/form'
import BookmarkGrid from './components/grid'

export default function BookmarksPage() {
  return (
    <>
      <>
        <Tabs defaultValue="all">
          <Page className="min-h-fit">
            <PageHeading>Bookmarks</PageHeading>

            {/* <AddBookmarkForm /> */}
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

        {/* Bookmarks */}
        {/* <div className="grid md:grid-cols-[3fr_1fr] gap-6 md:gap-12">
          <div>
            <Link href="https://effect.website/play#cf0057ce44ca">
              <h2 className="text-xl mb-3 hover:text-muted-foreground transition-colors">
                Setting a Value from non-Effect context
              </h2>
            </Link>
            <p className="text-sm text-muted-foreground">Using Deferred</p>
          </div>

          <div className="space-y-1">
            <Button asChild variant="ghost">
              <InlineLink
                href="https://discord.com/channels/795981131316985866/1364951930765447288"
                className="text-inherit"
              >
                <DiscordIcon />
                Discord
              </InlineLink>
            </Button>
          </div>
        </div> */}
        {/* <UnfurlPreview /> */}
      </>
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
