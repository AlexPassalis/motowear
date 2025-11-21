export const dynamic = 'force-dynamic'

import { PrivacyPolicyPageClient } from '@/app/(user)/privacy_policy/client'
import { getProductTypesCached, getShippingCached } from '../cache'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import type { Metadata } from 'next'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

export const metadata: Metadata = {
  title: 'Πολιτική Απορρήτου',
  alternates: { canonical: '/privacy_policy' },
  openGraph: {
    title: 'Πολιτική Απορρήτου | motowear.gr',
    url: '/privacy_policy',
  },
  other: {
    'page-type': 'privacy_policy',
  },
}

export default async function PrivacyPolicyPage() {
  const asyncFunctions = [getProductTypesCached, getShippingCached]
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
    resolved[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  return (
    <PrivacyPolicyPageClient
      product_types={product_types}
      shipping={shipping}
    />
  )
}
