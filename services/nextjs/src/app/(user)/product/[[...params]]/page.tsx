import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import {
  getShippingCached,
  getPagesCached,
  getProductTypesCached,
  getVariantsCached,
  getReviewsCached,
} from '@/app/(user)/cache'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { Metadata } from 'next'
import { specialVariant } from '@/data/magic'
import { envServer } from '@/envServer'

type typeParams = { params?: [type?: string, version?: string] }
type typeSearchParams = { color?: string }
type ProductPageProps = {
  params: Promise<typeParams>
  searchParams: Promise<typeSearchParams>
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const resolvedPageProps = await Promise.allSettled([params, searchParams])

  const resolvedParams = (
    resolvedPageProps[0] as PromiseFulfilledResult<typeParams>
  ).value
  if (!resolvedParams?.params || !resolvedParams.params[0]) {
    notFound()
  }
  const paramsProduct_type = decodeURIComponent(resolvedParams.params[0])
  const paramsProduct_version = resolvedParams.params[1]
    ? decodeURIComponent(resolvedParams.params[1])
    : undefined

  const resolvedSearchParams = (
    resolvedPageProps[1] as PromiseFulfilledResult<typeSearchParams>
  ).value
  const searchParamsProduct_color = resolvedSearchParams?.color
    ? decodeURIComponent(resolvedSearchParams.color)
    : undefined

  const resolved = await Promise.allSettled([
    getProductTypesCached(),
    getVariantsCached(),
    getPagesCached(),
  ])
  if (resolved[0].status === 'rejected') {
    console.error(resolved[0].reason)
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }
  if (resolved[1].status === 'rejected') {
    console.error(resolved[1].reason)
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }
  if (resolved[2].status === 'rejected') {
    console.error(resolved[2].reason)
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }

  const postgresVariants = resolved[1].value
    .filter((variant) => variant.product_type === paramsProduct_type)
    .sort(({ name: aName }, { name: bName }) => {
      if (aName === 'Επίλεξε μηχανή') {
        return -1
      }
      if (bName === 'Επίλεξε μηχανή') {
        return 1
      }
      if (specialVariant.includes(aName)) {
        return 1
      }
      if (specialVariant.includes(bName)) {
        return -1
      }
      return aName.localeCompare(bName)
    })
  if (
    !postgresVariants.find(
      (variant) => variant.product_type === paramsProduct_type,
    )
  ) {
    notFound()
  }

  const paramsVariant = paramsProduct_version
    ? postgresVariants.find((v) =>
        searchParamsProduct_color
          ? v.name === paramsProduct_version &&
            v.color === searchParamsProduct_color
          : v.name === paramsProduct_version,
      ) ?? undefined
    : undefined

  const title = `${
    paramsVariant
      ? `${paramsProduct_type} - ${paramsVariant.name}`
      : paramsProduct_type
  }`
  const page = resolved[2].value.find(
    (page) => page.product_type === paramsProduct_type,
  )
  const description = page ? page.product_description : ''
  const canonical = `/product/${paramsProduct_type}/${
    paramsProduct_version ? paramsProduct_version : ''
  }${`${
    searchParamsProduct_color ? `?color=${searchParamsProduct_color}` : ''
  }`}`
  const productDescription = paramsVariant
    ? paramsVariant.description
    : description

  const firstProductImageFileName = decodeURIComponent(
    postgresVariants[0].images[0],
  )
  const firstProductImageUrl = `${envServer.MINIO_PUBLIC_URL}/${paramsProduct_type}/${firstProductImageFileName}`

  return {
    title: title,
    description: description,
    alternates: { canonical: canonical },
    openGraph: {
      url: canonical,
      title: title,
      description: productDescription,
      images: [
        { url: firstProductImageUrl, width: 1200, height: 630, alt: title },
      ],
    },
    robots: { index: true, follow: true },
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
    notFound()
  }
  const paramsProduct_type = decodeURIComponent(resolvedParams.params[0])

  const postgresVariants = resolved[3].value
    .filter((variant) => variant.product_type === paramsProduct_type)
    .sort(({ name: aName }, { name: bName }) => {
      if (aName === 'Επίλεξε μηχανή') {
        return -1
      }
      if (bName === 'Επίλεξε μηχανή') {
        return 1
      }
      if (specialVariant.includes(aName)) {
        return 1
      }
      if (specialVariant.includes(bName)) {
        return -1
      }
      return aName.localeCompare(bName)
    })
  if (
    !postgresVariants.find(
      (variant) => variant.product_type === paramsProduct_type,
    )
  ) {
    notFound()
  }

  const variant = resolvedParams.params?.[1]
    ? decodeURIComponent(resolvedParams.params?.[1])
    : undefined
  const resolvedSearchParamsColor = (
    resolved[1] as PromiseFulfilledResult<{
      color?: string
    }>
  ).value?.color
  const paramsVariant = variant
    ? postgresVariants.find((v) =>
        resolvedSearchParamsColor
          ? v.name === variant && v.color === resolvedSearchParamsColor
          : v.name === variant,
      ) ?? undefined
    : undefined

  const upsells = postgresVariants
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

  const upsellVariants = resolved[3].value.filter((variant) =>
    upsells.some(
      (upsell) =>
        upsell.product_type === variant.product_type &&
        upsell.name === variant.name,
    ),
  )

  const page = resolved[4].value.find(
    (page) => page.product_type === paramsProduct_type,
  )!

  const postgres_reviews = resolved[5].value.filter(
    (review) => review.product_type === paramsProduct_type,
  )

  return (
    <ProductPageClient
      product_types={resolved[2].value}
      upsellVariants={upsellVariants}
      page={page}
      postgres_reviews={postgres_reviews}
      shipping={resolved[6].value}
      paramsProduct_type={paramsProduct_type}
      paramsVariant={paramsVariant}
      postgresVariants={postgresVariants}
    />
  )
}
