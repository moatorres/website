import React from 'react'

import { Page, PageHeading } from '@/components/page'
import { UnfurlPreview } from '@/components/unfurl'

export default function BookmarksPage() {
  return (
    <Page>
      <PageHeading>Bookmarks</PageHeading>
      <UnfurlPreview />
    </Page>
  )
}
