/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import LocalFont from 'next/font/local'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Page } from '@/components/page-component'
import { ThemeProvider } from '@/components/theme-provider'
import config from '@/data/config.json'

import './global.css'

export const metadata: Metadata = {
  metadataBase: new URL(config.previewUrl),
  alternates: {
    canonical: '/',
  },
  title: {
    default: config.title,
    template: `%s | ${config.author}`,
  },
  description: config.description,
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.previewUrl,
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

export const VisualSans = LocalFont({
  src: [
    {
      path: '../assets/fonts/visual-sans-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/visual-sans-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/visual-sans-semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/visual-sans-semibold-text.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
})

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={VisualSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Page>
            <Header />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
          </Page>
        </ThemeProvider>
      </body>
    </html>
  )
}
