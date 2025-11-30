import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import {
  getShippingCached,
  getPagesCached,
  getProductTypesCached,
  getProductPageDataCached,
  getReviewsCollectionCached,
} from '@/app/(user)/cache'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

type typeParams = { params?: [type?: string, version?: string] }
type typeSearchParams = { color?: string }
type ProductPageProps = {
  params: Promise<typeParams>
  searchParams: Promise<typeSearchParams>
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const results_1 = await Promise.allSettled([
    params,
    searchParams,
    getProductTypesCached(),
    getPagesCached(),
    getShippingCached(),
  ])

  if (results_1[0].status === 'rejected') {
    const location = `${ERROR.unexpected} params rejected`
    const err = results_1[0].reason
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
  }

  if (results_1[1].status === 'rejected') {
    const location = `${ERROR.unexpected} searchParams rejected`
    const err = results_1[1].reason
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
  }

  if (results_1[2].status === 'rejected') {
    const location = `${ERROR.postgres} getProductTypesCached`
    const err = results_1[2].reason
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (results_1[3].status === 'rejected') {
    const location = `${ERROR.postgres} getPagesCached`
    const err = results_1[3].reason
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (results_1[4].status === 'rejected') {
    const location = `${ERROR.postgres} getShippingCached`
    const err = results_1[4].reason
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  const resolved_params = results_1[0].value
  if (!resolved_params.params?.[0]) {
    notFound()
  }
  const collection_name = decodeURIComponent(resolved_params.params[0])

  const product = resolved_params.params?.[1]
    ? decodeURIComponent(resolved_params.params[1])
    : undefined

  const resolved_search_params = results_1[1].value
  const color = resolved_search_params?.color
    ? decodeURIComponent(resolved_search_params.color)
    : undefined

  const product_types = results_1[2].value
  const pages = results_1[3].value
  const shipping = results_1[4].value

  const page = pages.find((page) => page.product_type === collection_name)!

  const result_2 = await getProductPageDataCached(collection_name).catch(
    (err) => {
      const location = `${ERROR.postgres} getProductPageDataCached`
      handleError(location, err)

      redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
    },
  )

  const { collection, reviews, brands, products, upsells } = result_2
  if (!collection.name || products.length === 0) {
    return notFound()
  }

  return (
    <ProductPageClient
      product_types={product_types}
      page={page}
      shipping={shipping}
      reviews={reviews}
      collection={collection}
      brands={brands}
      product={product}
      color={color}
      products={products}
      upsells={upsells}
    />
  )
}
