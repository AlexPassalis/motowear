'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { facebookPixelPageView } from '@/lib/facebook-pixel/index'
import { googleAnalyticsPageView } from '@/lib/google-analytics'

export function Track() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname && !pathname.startsWith('/admin')) {
      facebookPixelPageView()
      googleAnalyticsPageView(pathname)
    }
  }, [])

  return null
}
