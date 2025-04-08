import { notFound, redirect } from 'next/navigation'
import { CollectionPageClient } from '@/app/(user)/collection/[type]/client'
import { getProductTypesCached, getVariantsCached } from '@/app/(user)/cache'
import { ROUTE_ERROR } from '@/data/routes'

type ProductPageProps = {
  params: Promise<{ type: string }>
}

export default async function CollectionPage({ params }: ProductPageProps) {
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

  const uniqueBrands = Array.from(
    new Set(postgresVariants.map(variant => variant.brand).filter(Boolean))
  )

  const uniqueVariants = Array.from(
    new Set(postgresVariants.map(variant => variant.name).filter(Boolean))
  )

  return (
    <CollectionPageClient
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      paramsProduct_type={paramsProduct_type}
      uniqueVariants={uniqueVariants}
      uniqueBrands={uniqueBrands}
    />
  )
}
