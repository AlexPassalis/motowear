export const dynamic = 'force-dynamic'

import { TermsOfServicePageClient } from '@/app/(user)/terms_of_service/client'
import { getProductTypesCached, getShippingCached } from '../cache'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import type { Metadata } from 'next'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: '/terms_of_service' },
  openGraph: {
    title: 'Terms of Service | motowear.gr',
    url: '/terms_of_service',
  },
  other: {
    'page-type': 'terms_of_service',
  },
}

export default async function TermsOfServicePage() {
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
    <TermsOfServicePageClient
      product_types={product_types}
      shipping={shipping}
    />
  )
}
