'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { facebookPixelPageView } from '@/lib/facebook-pixel/index'

export function FacebookPixel() {
  const pathname = usePathname()
  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    facebookPixelPageView() // fires on real route changes
  }, [pathname])

  return null
}
