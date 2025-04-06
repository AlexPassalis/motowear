import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import { getProductTypesCached, getVariantsCached } from '@/app/(user)/cache'
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
  ])
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[2].reason}`)
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
    ? postgresVariants.find(v => v.variant === decodeURIComponent(variant)) ??
      undefined
    : undefined

  return (
    <ProductPageClient
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      paramsProduct_type={paramsProduct_type}
      paramsVariant={paramsVariant}
      postgresVariants={postgresVariants}
    />
  )
}
