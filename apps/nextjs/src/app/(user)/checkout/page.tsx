export const dynamic = 'force-dynamic'

import { CheckoutPageClient } from '@/app/(user)/checkout/client'
import { ROUTE_ERROR } from '@/data/routes'
import { getShippingCached, getVariantsCached } from '@/app/(user)/cache'
import { redirect } from 'next/navigation'

export default async function CheckoutPage() {
  const resolved = await Promise.allSettled([
    getVariantsCached(),
    getShippingCached(),
  ])
  if (resolved[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[0].reason}`)
  }
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }

  return (
    <CheckoutPageClient
      all_variants={resolved[0].value}
      shipping={resolved[1].value}
    />
  )
}
