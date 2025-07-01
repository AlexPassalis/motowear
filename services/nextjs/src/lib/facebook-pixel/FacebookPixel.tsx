'use client'

import { useEffect } from 'react'
import { facebookPixelPageView } from '@/lib/facebook-pixel/index'

export function FacebookPixel() {
  useEffect(() => {
    facebookPixelPageView()
  }, [])

  return null
}
