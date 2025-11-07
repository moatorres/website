import { cn } from '@shadcn/ui'
import { Geist_Mono, Inter } from 'next/font/google'
import LocalFont from 'next/font/local'

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
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

export const fontVariables = cn(fontMono.variable, fontInter.variable)
