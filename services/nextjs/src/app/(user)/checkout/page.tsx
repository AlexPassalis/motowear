export const dynamic = 'force-dynamic'

import { CheckoutPageClient } from '@/app/(user)/checkout/client'
import { ROUTE_ERROR } from '@/data/routes'
import { getShippingCached } from '@/app/(user)/cache'
import { redirect } from 'next/navigation'
import { getOrderByOrderCode } from '@/utils/getPostgres'
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

type CheckoutPageProps = {
  searchParams: Promise<{ abandon_cart?: string; s?: string }>
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const asyncFunctions = [getShippingCached]
  const resolved = await Promise.allSettled([
    searchParams,
    ...asyncFunctions.map((asyncFunction) => asyncFunction()),
  ])
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      if (index === 0) {
        const location = `${ERROR.unexpected} searchParams rejected`
        const err = result.reason
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
      } else {
        const location = `${ERROR.postgres} ${asyncFunctions[index - 1].name}`
        const err = result.reason
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
      }
    }
  })

  const resolved_search_params = (
    resolved[0] as PromiseFulfilledResult<{
      abandon_cart?: string
      s?: string
    }>
  ).value
  const shipping = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  const isAbandonCart = resolved_search_params?.abandon_cart === 'true'

  const orderCode =
    typeof resolved_search_params.s === 'string'
      ? resolved_search_params.s
      : undefined
  let orderDetails
  if (orderCode) {
    const orderCode = resolved_search_params.s!
    try {
      const order = await getOrderByOrderCode(orderCode)
      orderDetails = {
        first_name: order.checkout.first_name,
        id: order.id,
        email: order.checkout.email,
      }
    } catch (err) {
      const location = `${ERROR.postgres} getOrderByOrderCode`
      handleError(location, err)

      redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
    }
  }

  return (
    <CheckoutPageClient
      isAbandonCart={isAbandonCart}
      orderDetails={orderDetails}
      shipping={shipping}
    />
  )
}
