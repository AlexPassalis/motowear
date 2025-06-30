'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { envClient } from '@/env'

const options = {
  autoConfig: true,
  debug: true, // NEEDS FIXING remove later if everything works as expected. It logs in production as well now.
}

export function FacebookPixel() {
  const pathname = usePathname()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pixelRef = useRef<any>(null)

  useEffect(() => {
    ;(async () => {
      const { default: ReactPixel } = await import('react-facebook-pixel')
      ReactPixel.init(envClient.FACEBOOK_PIXEL_ID, undefined, options)
      ReactPixel.pageView()
      pixelRef.current = ReactPixel
    })()
  }, [])

  useEffect(() => {
    if (pixelRef.current) {
      pixelRef.current.pageView()
    }
  }, [pathname])

  return null
}
