import { Button } from '@shadcn/ui'
import Link from 'next/link'
import React from 'react'

import { DiscordIcon } from '@/components/icons'
import { InlineLink } from '@/components/inline-link'
import { Page, PageHeading, PageSection } from '@/components/page'

export default function BookmarksPage() {
  return (
    <Page>
      <PageSection>
        <PageHeading>Bookmarks</PageHeading>
        {/* Bookmarks */}
        <div className="grid md:grid-cols-[3fr_1fr] gap-6 md:gap-12">
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
        </div>
      </PageSection>
    </Page>
  )
}
