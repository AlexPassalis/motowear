import { getVariantsCached, getProductTypesCached } from '@/app/(user)/cache'
import { HomePageClient } from '@/app/(user)/client'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { errorPostgres } from '@/data/error'

export default async function HomePage() {
  const resolved = await Promise.allSettled([
    getProductTypesCached(),
    getVariantsCached(),
  ])

  if (resolved[0].status === 'rejected' || resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  return (
    <HomePageClient
      product_types={resolved[0].value}
      all_variants={resolved[1].value}
    />
  )
}
