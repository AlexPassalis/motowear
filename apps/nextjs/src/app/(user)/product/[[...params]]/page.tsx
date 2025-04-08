import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import {
  getPagesCached,
  getProductTypesCached,
  getReviewsCached,
  getVariantsCached,
} from '@/app/(user)/cache'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'

type ProductPageProps = {
  params: Promise<{ params?: [type: string, version?: string] }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolved = await Promise.allSettled([
    params,
    getProductTypesCached(),
    getVariantsCached(),
    getPagesCached(),
    getReviewsCached(),
  ])
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[2].reason}`)
  }
  if (resolved[3].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[3].reason}`)
  }
  if (resolved[4].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[4].reason}`)
  }

  const resolvedParams = (
    resolved[0] as PromiseFulfilledResult<{
      params?: [type: string, version?: string]
    }>
  ).value
  if (!resolvedParams.params || resolvedParams.params.length < 1) {
    return notFound()
  }
  const paramsProduct_type = decodeURIComponent(resolvedParams.params[0])

  const postgresVariants = resolved[2].value.filter(
    variant => variant.product_type === paramsProduct_type
  )

  const variant = resolvedParams.params?.[1]
  const paramsVariant = variant
    ? postgresVariants.find(v => v.name === decodeURIComponent(variant)) ??
      undefined
    : undefined

  const page = resolved[3].value
    .find(page_group => page_group.productPages)!
    .productPages.find(page => page.product_type === paramsProduct_type)!

  const postgres_reviews = resolved[4].value.filter(
    review => review.product_type === paramsProduct_type
  )

  return (
    <ProductPageClient
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      page={page}
      postgres_reviews={postgres_reviews}
      paramsProduct_type={paramsProduct_type}
      paramsVariant={paramsVariant}
      postgresVariants={postgresVariants}
    />
  )
}
