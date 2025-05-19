import { Button } from '@shadcn/ui'
import React from 'react'

import {
  DiscordIcon,
  GitHubIcon,
  InstagramIcon,
  XIcon,
} from '@/components/icons'
import { InlineLink } from '@/components/inline-link'
import { Page, PageHeading, PageSection } from '@/components/page'
import config from '@/data/config.json'

export function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Page className="text-muted-foreground">
      <PageSection>
        <PageHeading className="text-foreground">Moa Torres</PageHeading>
        {children}
        <div className="space-y-3 space-x-3">
          <p>Find me on</p>
          <Button asChild variant="outline">
            <InlineLink href={config.githubUrl} className="text-inherit">
              <GitHubIcon /> GitHub
            </InlineLink>
          </Button>
          <Button asChild variant="outline">
            <InlineLink href={config.instagramUrl} className="text-inherit">
              <InstagramIcon /> Instagram
            </InlineLink>
          </Button>
          <Button asChild variant="outline">
            <InlineLink href={config.discordUrl} className="text-inherit">
              <DiscordIcon />
              Discord
            </InlineLink>
          </Button>
        </div>
        <div className="space-y-3 space-x-3 pt-3">
          <p>Inactive on</p>
          <Button asChild variant="ghost" size="sm">
            <InlineLink className="text-inherit">
              <XIcon /> Twitter
            </InlineLink>
          </Button>
        </div>
      </PageSection>
    </Page>
  )
}
