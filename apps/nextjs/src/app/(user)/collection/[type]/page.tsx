import { notFound, redirect } from 'next/navigation'
import { CollectionPageClient } from '@/app/(user)/collection/[type]/client'
import {
  getPagesCached,
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '@/app/(user)/cache'
import { ROUTE_ERROR } from '@/data/routes'
import { Metadata } from 'next'

type ProductPageProps = {
  params: Promise<{ type?: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolved = await Promise.allSettled([params, getPagesCached()])
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
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

  const description = resolved[1].value.find(
    (page) => page.product_type === paramsProduct_type,
  )!.product_description

  return {
    title: paramsProduct_type,
    description: description,
    alternates: { canonical: `/collection/${paramsProduct_type}` },
  }
}

export default async function CollectionPage({ params }: ProductPageProps) {
  const resolved = await Promise.allSettled([
    params,
    getProductTypesCached(),
    getVariantsCached(),
    getShippingCached(),
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
    (variant) => variant.product_type === paramsProduct_type,
  )

  if (
    !postgresVariants.find(
      (variant) => variant.product_type === paramsProduct_type,
    )
  ) {
    return notFound()
  }

  const uniqueVariants = postgresVariants
    .filter(
      (variant, index, self) =>
        self.findIndex(
          (v) => v.name === variant.name && v.color === variant.color,
        ) === index,
    )
    .map((variant) => {
      return {
        name: variant.name,
        color: variant.color,
        brand: variant.brand,
        image: variant.images[0],
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const uniqueBrands = uniqueVariants
    .map((variant) => variant.brand)
    .filter(Boolean) // remove empty strings ('')
    .filter(
      (item, index, self) =>
        index === self.findIndex((other) => other === item),
    )

  return (
    <CollectionPageClient
      paramsProduct_type={paramsProduct_type}
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      shipping={resolved[3].value}
      uniqueVariants={uniqueVariants}
      uniqueBrands={uniqueBrands}
    />
  )
}
