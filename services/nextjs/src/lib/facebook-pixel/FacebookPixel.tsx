'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { facebookPixelPageView } from '@/lib/facebook-pixel/index'

export function FacebookPixel() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      facebookPixelPageView()
    }
  }, [pathname])

  return null
}
