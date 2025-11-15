export const dynamic = 'force-dynamic'

import { ReviewPageClient } from '@/app/(user)/review/client'
import { getProductTypesCached, getShippingCached } from '@/app/(user)/cache'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { getOrder } from '@/utils/getPostgres'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

type ReviewPageProps = {
  searchParams: Promise<{ order_id?: string }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const asyncFunctions = [getProductTypesCached, getShippingCached]
  const resolved = await Promise.allSettled([
    searchParams,
    ...asyncFunctions.map((asyncFunction) => asyncFunction()),
  ])
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      const err = result.reason
      if (index === 0) {
        const location = `${ERROR.unexpected} searchParams rejected`
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
      } else {
        const location = `${ERROR.postgres} ${asyncFunctions[index - 1].name}`
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
      }
    }
  })

  const resolved_search_params = (
    resolved[0] as PromiseFulfilledResult<{ order_id?: string }>
  ).value
  const product_types = (
    resolved[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypesCached>>
    >
  ).value
  const shipping = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  if (!resolved_search_params?.order_id) {
    notFound()
  }

  let array
  try {
    array = await getOrder(resolved_search_params.order_id)
  } catch (err) {
    const location = `${ERROR.postgres} getOrder`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (array.length !== 1) {
    notFound()
  }

  const orderId = array[0].id
  const unique_product_types = array[0].cart
    .map((item) => item.product_type)
    .filter(
      (item, index, self) =>
        index === self.findIndex((other) => other === item),
    )
  const full_name = `${array[0].checkout.first_name} ${array[0].checkout.last_name}`

  return (
    <ReviewPageClient
      orderId={orderId}
      product_types={product_types}
      shipping={shipping}
      unique_product_types={unique_product_types}
      full_name={full_name}
    />
  )
}
