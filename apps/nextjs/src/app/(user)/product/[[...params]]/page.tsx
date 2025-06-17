import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import {
  getShippingCached,
  getPagesCached,
  getProductTypesCached,
  getReviewsCached,
  getVariantsCached,
} from '@/app/(user)/cache'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { Metadata } from 'next'

type ProductPageProps = {
  params: Promise<{ params?: [type: string, version?: string] }>
  searchParams: Promise<{ color?: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolved = await Promise.allSettled([
    params,
    getProductTypesCached(),
    getVariantsCached(),
    getPagesCached(),
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
      params?: [type: string, version?: string]
    }>
  ).value
  if (!resolvedParams.params || resolvedParams.params.length < 1) {
    return notFound()
  }
  const paramsProduct_type = decodeURIComponent(resolvedParams.params[0])

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

  const variant = resolvedParams.params?.[1]
  const paramsVariant = variant
    ? postgresVariants.find((v) => v.name === decodeURIComponent(variant)) ??
      undefined
    : undefined

  const page = resolved[3].value.find(
    (page) => page.product_type === paramsProduct_type,
  )!

  const canonicalPath = paramsVariant
    ? `/product/${encodeURIComponent(paramsProduct_type)}/${encodeURIComponent(
        paramsVariant.name,
      )}`
    : `/product/${encodeURIComponent(paramsProduct_type)}`

  return {
    title: paramsVariant
      ? `${paramsVariant.name} – ${paramsProduct_type}`
      : paramsProduct_type,
    description: page.product_description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: paramsVariant
        ? `${paramsVariant.name} – ${paramsProduct_type}`
        : paramsProduct_type,
      description: page.product_description,
      url: canonicalPath,
    },
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const resolved = await Promise.allSettled([
    params,
    searchParams,
    getProductTypesCached(),
    getVariantsCached(),
    getPagesCached(),
    getReviewsCached(),
    getShippingCached(),
  ])
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[2].reason}`)
  }
  if (resolved[3].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[3].reason}`)
  }
  if (resolved[4].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[4].reason}`)
  }
  if (resolved[5].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[5].reason}`)
  }
  if (resolved[6].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[6].reason}`)
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

  const postgresVariants = resolved[3].value.filter(
    (variant) => variant.product_type === paramsProduct_type,
  )

  if (
    !postgresVariants.find(
      (variant) => variant.product_type === paramsProduct_type,
    )
  ) {
    return notFound()
  }

  const variant = resolvedParams.params?.[1]
  const paramsVariant = variant
    ? postgresVariants.find((v) => v.name === decodeURIComponent(variant)) ??
      undefined
    : undefined

  const page = resolved[4].value.find(
    (page) => page.product_type === paramsProduct_type,
  )!

  const postgres_reviews = resolved[5].value.filter(
    (review) => review.product_type === paramsProduct_type,
  )

  const resolvedSearchParamsColor = (
    resolved[1] as PromiseFulfilledResult<{
      color?: string
    }>
  ).value?.color

  return (
    <ProductPageClient
      product_types={resolved[2].value}
      all_variants={resolved[3].value}
      page={page}
      postgres_reviews={postgres_reviews}
      shipping={resolved[6].value}
      paramsProduct_type={paramsProduct_type}
      paramsVariant={paramsVariant}
      postgresVariants={postgresVariants}
      searchParamsColor={resolvedSearchParamsColor}
    />
  )
}
