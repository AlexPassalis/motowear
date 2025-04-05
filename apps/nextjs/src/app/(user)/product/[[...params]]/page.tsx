import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import {
  getAllVariantsCached,
  getProductTypesCached,
  getVariantsCashed,
} from '@/utils/getPostgres'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { errorPostgres } from '@/data/error'

type ProductPageProps = {
  params: Promise<{ params?: [type: string, version?: string] }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolved = await Promise.allSettled([
    params,
    getProductTypesCached(),
    getAllVariantsCached(),
  ])
  if (resolved[1].status === 'rejected' || resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
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

  const postgresVariants = await getVariantsCashed(paramsProduct_type).catch(
    () => notFound()
  )

  const uniqueBrands = Array.from(
    new Set(postgresVariants.map(variant => variant.brand).filter(Boolean))
  )

  const uniqueVariants = Array.from(
    new Set(postgresVariants.map(variant => variant.variant).filter(Boolean))
  )

  const variant = resolvedParams.params?.[1]
  const paramsVariant = variant
    ? uniqueVariants.find(v => v === decodeURIComponent(variant))
    : undefined

  return (
    <ProductPageClient
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      paramsProduct_type={paramsProduct_type}
      paramsVariant={paramsVariant}
      postgresVariants={postgresVariants}
      uniqueBrands={uniqueBrands}
      uniqueVariants={uniqueVariants}
    />
  )
}
