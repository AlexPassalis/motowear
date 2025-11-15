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
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

export default async function HomePage() {
  const asyncFunctions = [
    getHomePageCached,
    getHomePageVariantsCached,
    getProductTypesCached,
    getVariantsCached,
    getShippingCached,
  ]
  const resolved = await Promise.allSettled(
    asyncFunctions.map((asyncFunction) => asyncFunction()),
  )
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      const location = `${ERROR.postgres} ${asyncFunctions[index].name}`
      const err = result.reason
      handleError(location, err)

      redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
    }
  })

  const home_page = (
    resolved[0] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getHomePageCached>>
    >
  ).value
  const home_page_variants = (
    resolved[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getHomePageVariantsCached>>
    >
  ).value
  const product_types = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypesCached>>
    >
  ).value
  const variants = (
    resolved[3] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getVariantsCached>>
    >
  ).value
  const shipping = (
    resolved[4] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  return (
    <HomePageClient
      home_page={home_page}
      home_page_variants={home_page_variants}
      product_types={product_types}
      shipping={shipping}
    />
  )
}
