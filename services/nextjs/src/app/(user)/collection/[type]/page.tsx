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
  const results_1 = await Promise.allSettled([
    params,
    getProductTypesCached(),
    getShippingCached(),
  ])

  if (results_1[0].status === 'rejected') {
    const location = `${ERROR.unexpected} params rejected`
    const err = results_1[0].reason
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
  }

  if (results_1[1].status === 'rejected') {
    const location = `${ERROR.postgres} getProductTypesCached`
    const err = results_1[1].reason
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (results_1[2].status === 'rejected') {
    const location = `${ERROR.postgres} getShippingCached`
    const err = results_1[2].reason
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  const resolved_params = results_1[0].value
  if (!resolved_params.type) {
    notFound()
  }
  const collection = decodeURIComponent(resolved_params.type)

  const product_types = results_1[1].value
  const shipping = results_1[2].value

  const results_2 = await getCollectionPageDataCached(collection).catch(
    (err) => {
      const location = `${ERROR.postgres} getCollectionPageDataCached`
      handleError(location, err)

      redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
    },
  )

  const { brands, products } = results_2
  if (products.size === 0) {
    notFound()
  }

  return (
    <CollectionPageClient
      collection={collection}
      product_types={product_types}
      shipping={shipping}
      brands={brands}
      products={products}
    />
  )
}
