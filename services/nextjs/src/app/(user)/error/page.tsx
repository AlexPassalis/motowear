import { ErrorPageClient } from '@/app/(user)/error/client'
import { ROUTE_ERROR } from '@/data/routes'
import {
  getVariantsCached,
  getProductTypesCached,
  getShippingCached,
} from '@/app/(user)/cache'
import { redirect } from 'next/navigation'
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

type ErrorPageProps = {
  searchParams: Promise<{ message?: string }>
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const asyncFunctions = [
    getProductTypesCached,
    getVariantsCached,
    getShippingCached,
  ]
  const resolved = await Promise.allSettled([
    searchParams,
    ...asyncFunctions.map((asyncFunction) => asyncFunction()),
  ])
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      if (index > 0) {
        const location = `${ERROR.postgres} ${asyncFunctions[index - 1].name}`
        const err = result.reason
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
      }
    }
  })

  const resolved_search_params = (
    resolved[0] as PromiseFulfilledResult<{ message?: string }>
  ).value
  const product_types = (
    resolved[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypesCached>>
    >
  ).value
  const variants = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getVariantsCached>>
    >
  ).value
  const shipping = (
    resolved[3] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  const message = resolved_search_params?.message || ERROR.unexpected

  return (
    <ErrorPageClient
      product_types={product_types}
      shipping={shipping}
      message={message}
    />
  )
}
