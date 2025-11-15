export const dynamic = 'force-dynamic'

import { UnsubscribePageClient } from '@/app/(user)/unsubscribe/client'
import { getProductTypesCached, getShippingCached } from '@/app/(user)/cache'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { unsubscribe } from '@/utils/getPostgres'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

type UnsubscribePageProps = {
  searchParams: Promise<{ email?: string }>
}

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
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
    resolved[0] as PromiseFulfilledResult<{ email?: string }>
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

  if (!resolved_search_params?.email) {
    notFound()
  }

  let deletedCount
  try {
    deletedCount = await unsubscribe(resolved_search_params.email)
  } catch (err) {
    const location = `${ERROR.postgres} unsubscribe`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (deletedCount.rowCount !== 1) {
    notFound()
  }

  return (
    <UnsubscribePageClient
      email={resolved_search_params.email}
      product_types={product_types}
      shipping={shipping}
    />
  )
}
