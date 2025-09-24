import { unstable_ViewTransition as ViewTransition } from 'react'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <Header />
      {children}
      <Footer />
    </ViewTransition>
  )
}
