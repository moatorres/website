/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import React from 'react'

import { Page, PageHeading, PageSection } from '@/components/page'

import SnippetList from './snippet-list'

export default function ProjectsPage() {
  return (
    <Page>
      <PageSection>
        <PageHeading>Snippets</PageHeading>
        <SnippetList />
      </PageSection>
    </Page>
  )
}
