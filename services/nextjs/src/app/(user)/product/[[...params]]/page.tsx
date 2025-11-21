import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import {
  getShippingCached,
  getPagesCached,
  getProductTypesCached,
  getVariantsProductPageCached,
  getProductTypeReviewsCached,
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
  const resolved_1 = await Promise.allSettled([
    params,
    searchParams,
    getProductTypesCached(),
    getPagesCached(),
    getShippingCached(),
  ])
  resolved_1.forEach((result, index) => {
    if (result.status !== 'rejected') {
      return
    }

    const err = result.reason
    if (index < 2) {
      const location = `${ERROR.unexpected} resolved_1 index: ${index}`
      handleError(location, err)

      redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
    } else {
      const location = `${ERROR.postgres} resolved_1 index: ${index}`
      handleError(location, err)

      redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
    }
  })

  const resolved_params = (resolved_1[0] as PromiseFulfilledResult<typeParams>)
    .value
  if (!resolved_params.params || resolved_params.params.length < 1) {
    notFound()
  }
  const params_product_type = decodeURIComponent(resolved_params.params[0]!)
  const variant = resolved_params.params?.[1]
    ? decodeURIComponent(resolved_params.params?.[1])
    : undefined

  const resolved_search_params = (
    resolved_1[1] as PromiseFulfilledResult<{
      color?: string
    }>
  ).value
  const search_params_color = resolved_search_params?.color

  const product_types = (
    resolved_1[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypesCached>>
    >
  ).value
  const pages = (
    resolved_1[3] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getPagesCached>>
    >
  ).value
  const shipping = (
    resolved_1[4] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  const resolved_2 = await Promise.allSettled([
    getVariantsProductPageCached(params_product_type),
    getProductTypeReviewsCached(params_product_type),
  ])
  resolved_2.forEach((result, index) => {
    if (result.status !== 'rejected') {
      return
    }

    const err = result.reason
    const location = `${ERROR.postgres} resolved_2 index: ${index}`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  })

  const variants = (
    resolved_2[0] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getVariantsProductPageCached>>
    >
  ).value

  const reviews = (
    resolved_2[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypeReviewsCached>>
    >
  ).value

  const paramsVariant = variant
    ? variants.find((v) =>
        search_params_color
          ? v.name === variant && v.color === search_params_color
          : v.name === variant,
      ) ?? undefined
    : undefined

  const upsells = variants
    .map((variant) => variant.upsell)
    .filter((upsell) => upsell !== null)
    .filter(
      (upsell, index, self) =>
        index ===
        self.findIndex(
          (other) =>
            other.product_type === upsell.product_type &&
            other.name === upsell.name,
        ),
    )

  const upsellVariants = variants.filter((variant) =>
    upsells.some(
      (upsell) =>
        upsell.product_type === variant.product_type &&
        upsell.name === variant.name,
    ),
  )

  const page = pages.find((page) => page.product_type === params_product_type)!

  return (
    <ProductPageClient
      product_types={product_types}
      upsellVariants={upsellVariants}
      page={page}
      postgres_reviews={reviews}
      shipping={shipping}
      paramsProduct_type={params_product_type}
      paramsVariant={paramsVariant}
      postgresVariants={variants}
    />
  )
}
