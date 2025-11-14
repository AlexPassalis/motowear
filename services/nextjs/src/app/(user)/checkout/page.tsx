export const dynamic = 'force-dynamic'

import { CheckoutPageClient } from '@/app/(user)/checkout/client'
import { ROUTE_ERROR } from '@/data/routes'
import { getShippingCached, getVariantsCached } from '@/app/(user)/cache'
import { redirect } from 'next/navigation'
import { getOrderByOrderCode } from '@/utils/getPostgres'

type CheckoutPageProps = {
  searchParams: Promise<{ abandon_cart?: string; s?: string }>
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
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }

  const resolvedSearchParams = (
    resolved[0] as PromiseFulfilledResult<{
      abandon_cart?: string
      s?: string
    }>
  ).value

  const isAbandonCart = resolvedSearchParams?.abandon_cart === 'true'

  const orderCode =
    typeof resolvedSearchParams.s === 'string'
      ? resolvedSearchParams.s
      : undefined
  let orderDetails
  if (orderCode) {
    const orderCode = resolvedSearchParams.s!
    try {
      const order = await getOrderByOrderCode(orderCode)
      orderDetails = {
        first_name: order.checkout.first_name,
        id: order.id,
        email: order.checkout.email,
      }
    } catch (err) {
      console.error(err)
      redirect(`${ROUTE_ERROR}?message=POSTGRES`)
    }
  }

  return (
    <CheckoutPageClient
      isAbandonCart={isAbandonCart}
      orderDetails={orderDetails}
      shipping={resolved[2].value}
    />
  )
}
