/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { cn, Toaster } from '@shadcn/ui'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { ActiveThemeProvider } from '@/components/active-theme'
import { SessionProvider, ThemeProvider } from '@/components/context'
import config from '@/data/config.json'

import './global.css'

import { fontVariables, VisualSans } from './fonts'

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: 'oklch(0.205 0.008 275)',
}

export const metadata: Metadata = {
  metadataBase: new URL(config.baseUrl),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': config.baseUrl + '/rss',
    },
  },
  title: {
    default: config.title,
    template: `%s | ${config.title}`,
  },
  description: config.description,
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.baseUrl,
    siteName: config.title,
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  const activeTheme = await cookies().then((store) => store.get('theme')?.value)
  const isScaled = activeTheme?.endsWith('-scaled')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'overscroll-none font-sans antialiased',
          activeTheme ? `theme-${activeTheme}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables,
          VisualSans.className
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <ActiveThemeProvider initialTheme={activeTheme}>
              {children}
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </ActiveThemeProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
