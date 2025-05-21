import React from 'react'

import { Page, PageHeading } from '@/components/page'

import AddBookmarkForm from './components/form'

export default function BookmarksPage() {
  return (
    <Page>
      <PageHeading>Bookmarks</PageHeading>
      <AddBookmarkForm />
    </Page>
  )
}
