export const dynamic = 'force-dynamic'

import { ReturnPolicyPageClient } from '@/app/(user)/return_policy/client'
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
  title: 'Πολιτική Επιστροφών & Αλλαγών',
  alternates: { canonical: '/return_policy' },
  openGraph: {
    title: 'Πολιτική Επιστροφών & Αλλαγών | motowear.gr',
    url: '/return_policy',
  },
  other: {
    'page-type': 'return_policy',
  },
}

export default async function ReturnPolicyPage() {
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
    <ReturnPolicyPageClient product_types={product_types} shipping={shipping} />
  )
}
