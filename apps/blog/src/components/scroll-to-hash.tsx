'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function ScrollToHash({ offset = -56 }: { offset?: number }) {
  const pathname = usePathname()

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const el = document.getElementById(hash.substring(1))
      if (el) {
        setTimeout(() => {
          const top =
            el.getBoundingClientRect().top + window.pageYOffset - offset
          window.scrollTo({ top, behavior: 'smooth' })
        }, 0)
      }
    }
  }, [pathname, offset])

  return null
}
