import { notFound, redirect } from 'next/navigation'
import { CollectionPageClient } from '@/app/(user)/collection/[type]/client'
import { getProductTypesCached, getVariantsCached } from '@/app/(user)/cache'
import { ROUTE_ERROR } from '@/data/routes'

type ProductPageProps = {
  params: Promise<{ type?: string }>
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
      type: string
    }>
  ).value
  if (!resolvedParams?.type) {
    return notFound()
  }
  const paramsProduct_type = decodeURIComponent(resolvedParams.type)

  const postgresVariants = resolved[2].value.filter(
    variant => variant.product_type === paramsProduct_type
  )

  if (
    !postgresVariants.find(
      variant => variant.product_type === paramsProduct_type
    )
  ) {
    return notFound()
  }

  const uniqueVariants = postgresVariants
    .filter(
      (variant, index, self) =>
        self.findIndex(v => v.name === variant.name) === index
    )
    .map(variant => {
      return {
        image: variant.images[0],
        name: variant.name,
        brand: variant.brand,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const uniqueBrands = [
    ...new Set(uniqueVariants.map(variant => variant.brand)),
  ]

  return (
    <CollectionPageClient
      paramsProduct_type={paramsProduct_type}
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      uniqueVariants={uniqueVariants}
      uniqueBrands={uniqueBrands}
    />
  )
}
