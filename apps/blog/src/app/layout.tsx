import { cn, Toaster } from '@shadcn/ui'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { unstable_ViewTransition as ViewTransition } from 'react'

import { SessionProvider } from '@/components/context/session'
import { ThemeProvider } from '@/components/context/theme'
import config from '@/data/config.json'

import './global.css'

import { fontVariables, VisualSans } from './fonts'

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: 'oklch(0.205 0.008 275)',
}

const ogImageUrl = `${config.baseUrl}/og?title=${encodeURIComponent(
  config.title
)}&description=${encodeURIComponent(config.description)}&frame=0`

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
  keywords: ['web development', 'engineering', config.author.toLowerCase()],
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.baseUrl,
    siteName: config.title,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${config.title} – Open Graph`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: config.title,
    description: config.description,
    creator: '@moatorres',
    images: [ogImageUrl],
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
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  authors: [
    {
      name: config.author,
      url: config.baseUrl,
    },
  ],
  creator: config.author,
  publisher: config.author,
}

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
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
              } catch {}
            `,
          }}
        />
      </head>
      <ViewTransition>
        <body
          className={cn(
            'overscroll-none font-sans antialiased',
            fontVariables,
            VisualSans.className
          )}
        >
          <SessionProvider>
            <ThemeProvider>
              {children}
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
          </SessionProvider>
        </body>
      </ViewTransition>
    </html>
  )
}
