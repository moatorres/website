/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import Link from 'next/link'

import { Button } from '@/components/button'
import { InlineLink } from '@/components/inline-link'
import { LinksSection } from '@/components/links-section'
import { Page, PageHeading, PageSection } from '@/components/page'
import config from '@/data/config.json'
import { AtIcon, DiscordIcon, GitHubIcon, InstagramIcon, XIcon } from '@/icons'
import { getLatestArticles } from '@/utils/articles'
import { formatDate } from '@/utils/format'
import { getWeatherEmoji } from '@/utils/weather'

export default async function BlogPage() {
  const articles = getLatestArticles()
  const { emoji, temperature } = await getWeatherEmoji()

  return (
    <Page>
      <PageSection>
        {/* Page Header */}
        <div className="max-w-2xl mb-16">
          <PageHeading>Moa Torres</PageHeading>
          <div className="space-y-6 leading-relaxed text-muted-foreground">
            <p>
              Hey! I&apos;m Moa, an open-source developer focused on
              human-centered technology.
            </p>
            <LinksSection />
            <p>
              I&apos;m driven by curiosity 👀. Crafting and collaborating with
              others is a process that I really enjoy. Check out the{' '}
              <InlineLink href="/projects" underline>
                projects I&apos;m building
              </InlineLink>
              .
            </p>
            <p>
              I write ✍🏼 about open source, programming, automation, and
              everything in between. You can{' '}
              <InlineLink href="/blog" underline>
                find the blog posts here.
              </InlineLink>{' '}
              I&apos;m passionate about DX, simplifying infrastructure, and
              balancing functional rigor with world-class aesthetics.
            </p>
            <p>
              I interface between technical and non-technical audiences 📣,
              backend and frontend, infrastructure and design, policy and
              engineering. I&apos;m also a keen{' '}
              <InlineLink href="/photos" underline>
                photographer
              </InlineLink>{' '}
              and skillful project manager.
            </p>
            <p>
              I&apos;m currently living in{' '}
              <InlineLink href="https://en.wikipedia.org/wiki/Recife" underline>
                Recife
              </InlineLink>{' '}
              <sup className="text-xs font-mono">
                {temperature && `${Math.round(temperature)}°C`}{' '}
              </sup>
              {emoji}. If you&apos;re nearby, don&apos;t hesitate to reach out
              so we can grab a coffee or work together.
            </p>
            <div className="space-y-3 space-x-3">
              <p>Find me on</p>
              <Button asChild variant="outline">
                <InlineLink
                  href={config.authorGithubUrl}
                  className="text-inherit"
                >
                  <GitHubIcon /> GitHub
                </InlineLink>
              </Button>
              <Button asChild variant="outline">
                <InlineLink
                  href={config.authorInstagramUrl}
                  className="text-inherit"
                >
                  <InstagramIcon /> Instagram
                </InlineLink>
              </Button>
              <Button asChild variant="outline">
                <InlineLink
                  href={config.authorDiscordUrl}
                  className="text-inherit"
                >
                  <DiscordIcon />
                  Discord
                </InlineLink>
              </Button>
            </div>
            <div className="hidden">
              <p>
                Or email me at{' '}
                <span className="font-mono">
                  hello
                  <AtIcon className="inline py-0.5" />
                  moatorres.com
                </span>
              </p>
            </div>
            <div className="space-y-3 space-x-3">
              <p>Inactive on</p>
              <Button asChild variant="ghost" size="sm">
                <InlineLink className="text-inherit">
                  <XIcon /> Twitter
                </InlineLink>
              </Button>
            </div>
          </div>
        </div>

        {/* Latest Articles */}
        <div className="max-w-4xl hidden">
          <h2 className="text-2xl mb-6">Latest Articles</h2>
          {articles.map((article) => (
            <article key={article.id} className="mb-4 pb-4">
              <div className="grid sm:grid-cols-[1fr_3fr] gap-6 md:gap-12">
                <div className="space-y-1 mt-0.5 sm:block hidden">
                  <div className="text-sm text-muted-foreground">
                    {article.category}
                  </div>
                  <div className="text-sm">{formatDate(article.date)}</div>
                  <div className="text-sm text-muted-foreground">
                    {article.readTime} read
                  </div>
                </div>

                <div>
                  <Link href={article.href}>
                    <h2 className="text-xl mb-3 hover:text-muted-foreground transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4">
                    {article.summary}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PageSection>
    </Page>
  )
}
