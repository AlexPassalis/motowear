export const dynamic = 'force-dynamic'

import {
  getHomePageCached,
  getVariantsCached,
  getProductTypesCached,
  getShippingCached,
  getHomePageVariantsCached,
} from '@/app/(user)/cache'
import { HomePageClient } from '@/app/(user)/client'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'

export default async function HomePage() {
  const resolved = await Promise.allSettled([
    getHomePageCached(),
    getHomePageVariantsCached(),
    getProductTypesCached(),
    getVariantsCached(),
    getShippingCached(),
  ])
  if (resolved[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[0].reason}`)
  }
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[2].reason}`)
  }
  if (resolved[3].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[3].reason}`)
  }
  if (resolved[4].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[4].reason}`)
  }

  return (
    <HomePageClient
      home_page={resolved[0].value}
      home_page_variants={resolved[1].value}
      product_types={resolved[2].value}
      shipping={resolved[4].value}
    />
  )
}
