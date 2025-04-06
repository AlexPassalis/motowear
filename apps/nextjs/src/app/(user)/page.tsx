import { getVariantsCached, getProductTypesCached } from '@/app/(user)/cache'
import { HomePageClient } from '@/app/(user)/client'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'

export default async function HomePage() {
  const resolved = await Promise.allSettled([
    getProductTypesCached(),
    getVariantsCached(),
  ])
  if (resolved[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[0].reason}`)
  }
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }

  return (
    <HomePageClient
      product_types={resolved[0].value}
      all_variants={resolved[1].value}
    />
  )
}
