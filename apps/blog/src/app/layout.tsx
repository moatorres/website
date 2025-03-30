/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import type { Metadata } from 'next'
import LocalFont from 'next/font/local'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Page } from '@/components/page-component'
import { ThemeProvider } from '@/components/theme-provider'
import config from '@/data/config.json'

import './global.css'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  description: config.description,
  metadataBase: new URL(config.url),
  title: {
    default: config.title,
    template: `%s | ${config.title}`,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          </Page>
        </ThemeProvider>
      </body>
    </html>
  )
}
