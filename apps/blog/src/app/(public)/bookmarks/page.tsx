import { Button } from '@shadcn/ui'
import Link from 'next/link'
import React from 'react'

import { ButtonGroup } from '@/components/button-group'
import { Page, PageHeading } from '@/components/page'

export default function BookmarksPage() {
  return (
    <Page>
      <PageHeading>Bookmarks</PageHeading>
      <ButtonGroup orientation="vertical">
        <Button asChild>
          <Link href="/bookmarks/v0">V0</Link>
        </Button>
        <Button asChild>
          <Link href="/bookmarks/v1">V1</Link>
        </Button>
        <Button asChild>
          <Link href="/bookmarks/v2">V2</Link>
        </Button>
        <Button asChild>
          <Link href="/bookmarks/v3">V3</Link>
        </Button>
      </ButtonGroup>
    </Page>
  )
}
