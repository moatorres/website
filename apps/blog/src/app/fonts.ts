/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { cn } from '@shadcn/ui'
import {
  Geist,
  Geist_Mono,
  Instrument_Sans,
  Inter,
  Mulish,
  Noto_Sans_Mono,
} from 'next/font/google'
import LocalFont from 'next/font/local'

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const fontInstrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
})

const fontNotoMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-noto-mono',
})

const fontMullish = Mulish({
  subsets: ['latin'],
  variable: '--font-mullish',
})

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

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

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontInstrument.variable,
  fontNotoMono.variable,
  fontMullish.variable,
  fontInter.variable
)
