'use client'

import { useEffect } from 'react'
import { facebookPixelPageView } from '@/lib/facebook-pixel/index'
import { usePathname } from 'next/navigation'

export function FacebookPixel() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname?.startsWith('/admin')) {
      facebookPixelPageView()
    }
  }, [])

  return null
}
