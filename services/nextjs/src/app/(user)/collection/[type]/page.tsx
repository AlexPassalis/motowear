import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  getPagesCached,
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '@/app/(user)/cache'
import { ROUTE_ERROR } from '@/data/routes'
import { envServer } from '@/envServer'

import { CollectionPageClient } from '@/app/(user)/collection/[type]/client'
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

type typeParams = { type?: string }
type ProductPageProps = {
  params: Promise<typeParams>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  if (!resolvedParams?.type) {
    notFound()
  }
  const paramsProduct_type = decodeURIComponent(resolvedParams.type)

  const asyncFunctions = [getPagesCached, getVariantsCached]
  const resolved = await Promise.allSettled(
    asyncFunctions.map((asyncFunction) => asyncFunction()),
  )
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      const location = `${ERROR.postgres} ${asyncFunctions[index].name}`
      const err = result.reason
      handleError(location, err)

      redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
    }
  })

  const pages = (
    resolved[0] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getPagesCached>>
    >
  ).value
  const variants = (
    resolved[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getVariantsCached>>
    >
  ).value

  const description = pages.find(
    (page) => page.product_type === paramsProduct_type,
  )!.product_description
  const canonical = `/collection/${paramsProduct_type}`

  const firstProductImageFileName = decodeURIComponent(
    variants
      .filter((variant) => variant.product_type === paramsProduct_type)
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
      .sort((a, b) => a.name.localeCompare(b.name))[0].image,
  )
  const firstProductImageUrl = `${envServer.MINIO_PUBLIC_URL}/${paramsProduct_type}/${firstProductImageFileName}`

  return {
    title: paramsProduct_type,
    description: description,
    alternates: { canonical: canonical },
    openGraph: {
      url: canonical,
      title: paramsProduct_type,
      description: description,
      images: [
        {
          url: firstProductImageUrl,
          width: 1200,
          height: 630,
          alt: paramsProduct_type,
        },
      ],
    },
    robots: { index: true, follow: true },
  }
}

export default async function CollectionPage({ params }: ProductPageProps) {
  const asyncFunctions = [
    getProductTypesCached,
    getVariantsCached,
    getShippingCached,
  ]
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
  const product_types = (
    resolved[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypesCached>>
    >
  ).value
  const variants = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getVariantsCached>>
    >
  ).value
  const shipping = (
    resolved[3] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  if (!resolved_params?.type) {
    notFound()
  }

  const paramsProductType = decodeURIComponent(resolved_params.type)

  const postgresVariants = variants.filter(
    (variant) => variant.product_type === paramsProductType,
  )

  if (
    !postgresVariants.find(
      (variant) => variant.product_type === paramsProductType,
    )
  ) {
    notFound()
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
      paramsProduct_type={paramsProductType}
      product_types={product_types}
      shipping={shipping}
      uniqueVariants={uniqueVariants}
      uniqueBrands={uniqueBrands}
    />
  )
}
