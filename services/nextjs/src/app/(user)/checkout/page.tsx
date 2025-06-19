export const dynamic = 'force-dynamic'

import { CheckoutPageClient } from '@/app/(user)/checkout/client'
import { ROUTE_ERROR } from '@/data/routes'
import { getShippingCached, getVariantsCached } from '@/app/(user)/cache'
import { redirect } from 'next/navigation'
import { getOrderByOrderCode } from '@/utils/getPostgres'

type CheckoutPageProps = {
  searchParams: Promise<{ abandon_cart?: string; s?: string; eventId?: string }>
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const resolved = await Promise.allSettled([
    searchParams,
    getVariantsCached(),
    getShippingCached(),
  ])
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[2].reason}`)
  }

  const resolvedSearchParams = (
    resolved[0] as PromiseFulfilledResult<{
      abandon_cart?: string
      s?: string
      eventId?: string
    }>
  ).value

  const isAbandonCart = resolvedSearchParams?.abandon_cart === 'true'
  const eventId =
    typeof resolvedSearchParams.eventId === 'string'
      ? resolvedSearchParams.eventId
      : undefined

  let orderDetails
  if (eventId) {
    const orderCode = resolvedSearchParams.s!

    try {
      const order = await getOrderByOrderCode(orderCode)
      orderDetails = {
        first_name: order.checkout.first_name,
        id: order.id,
        email: order.checkout.email,
      }
    } catch (err) {
      redirect(`${ROUTE_ERROR}?message=${err}`)
    }
  }

  return (
    <CheckoutPageClient
      isAbandonCart={isAbandonCart}
      orderDetails={orderDetails}
      all_variants={resolved[1].value}
      shipping={resolved[2].value}
    />
  )
}
