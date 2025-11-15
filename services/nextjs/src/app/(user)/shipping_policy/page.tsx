export const dynamic = 'force-dynamic'

import { ShippingPolicyPageClient } from '@/app/(user)/shipping_policy/client'
import {
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '../cache'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import type { Metadata } from 'next'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

export const metadata: Metadata = {
  title: 'Πολιτική Αποστολών',
  alternates: { canonical: '/shipping_policy' },
  openGraph: {
    title: 'Πολιτική Αποστολών | motowear.gr',
    url: '/shipping_policy',
  },
  other: {
    'page-type': 'shipping_policy',
  },
}

export default async function ShippingPolicyPage() {
  const asyncFunctions = [
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

  const product_types = (
    resolved[0] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypesCached>>
    >
  ).value
  const shipping = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  return (
    <ShippingPolicyPageClient
      product_types={product_types}
      shipping={shipping}
    />
  )
}
