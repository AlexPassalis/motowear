import { notFound, redirect } from 'next/navigation'
import {
  getProductTypesCached,
  getShippingCached,
  getCollectionPageDataCached,
} from '@/app/(user)/cache'
import { ROUTE_ERROR } from '@/data/routes'

import { CollectionPageClient } from '@/app/(user)/collection/[type]/client'
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

type typeParams = { type?: string }
type ProductPageProps = {
  params: Promise<typeParams>
}

export default async function CollectionPage({ params }: ProductPageProps) {
  const asyncFunctions = [getProductTypesCached, getShippingCached]
  const resolved = await Promise.allSettled([
    params,
    ...asyncFunctions.map((asyncFunction) => asyncFunction()),
  ])
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      if (index === 0) {
        const location = `${ERROR.unexpected} params rejected`
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

  const resolved_params = (resolved[0] as PromiseFulfilledResult<typeParams>)
    .value
  if (!resolved_params.type) {
    notFound()
  }
  const params_product_type = decodeURIComponent(resolved_params.type)

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

  const resolved_2 = await getCollectionPageDataCached(
    params_product_type,
  ).catch((err) => {
    const location = `${ERROR.postgres} getCollectionPageDataCached`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  })

  const { variants, brands } = resolved_2

  return (
    <CollectionPageClient
      paramsProduct_type={params_product_type}
      product_types={product_types}
      shipping={shipping}
      uniqueVariants={variants}
      uniqueBrands={brands}
    />
  )
}
