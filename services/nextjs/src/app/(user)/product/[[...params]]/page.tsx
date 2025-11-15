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
import { specialVariant, ERROR } from '@/data/magic'
import { envServer } from '@/envServer'
import { handleError } from '@/utils/error/handleError'

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

  const asyncFunctions = [
    getProductTypesCached,
    getVariantsCached,
    getPagesCached,
  ]
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

  const product_types = (
    resolved[0] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypesCached>>
    >
  ).value
  const variants = (
    resolved[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getVariantsCached>>
    >
  ).value
  const pages = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getPagesCached>>
    >
  ).value

  const postgresVariants = variants
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
  const page = pages.find((page) => page.product_type === paramsProduct_type)
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
  const asyncFunctions = [
    getProductTypesCached,
    getVariantsCached,
    getPagesCached,
    getReviewsCached,
    getShippingCached,
  ]
  const resolved = await Promise.allSettled([
    params,
    searchParams,
    ...asyncFunctions.map((asyncFunction) => asyncFunction()),
  ])
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      if (index === 0) {
        const location = `${ERROR.unexpected} params rejected`
        const err = result.reason
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
      } else if (index === 1) {
        const location = `${ERROR.unexpected} searchParams rejected`
        const err = result.reason
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
      } else {
        const location = `${ERROR.postgres} ${asyncFunctions[index - 2].name}`
        const err = result.reason
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
      }
    }
  })

  const resolved_params = (
    resolved[0] as PromiseFulfilledResult<{
      params?: [type: string, version?: string]
    }>
  ).value

  if (!resolved_params.params || resolved_params.params.length < 1) {
    notFound()
  }

  const paramsProduct_type = decodeURIComponent(resolved_params.params[0])

  const product_types = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductTypesCached>>
    >
  ).value
  const variants = (
    resolved[3] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getVariantsCached>>
    >
  ).value
  const pages = (
    resolved[4] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getPagesCached>>
    >
  ).value
  const reviews = (
    resolved[5] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getReviewsCached>>
    >
  ).value
  const shipping = (
    resolved[6] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShippingCached>>
    >
  ).value

  const postgresVariants = variants
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

  const variant = resolved_params.params?.[1]
    ? decodeURIComponent(resolved_params.params?.[1])
    : undefined
  const resolved_search_params = (
    resolved[1] as PromiseFulfilledResult<{
      color?: string
    }>
  ).value
  const resolvedSearchParamsColor = resolved_search_params?.color
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

  const upsellVariants = variants.filter((variant) =>
    upsells.some(
      (upsell) =>
        upsell.product_type === variant.product_type &&
        upsell.name === variant.name,
    ),
  )

  const page = pages.find((page) => page.product_type === paramsProduct_type)!

  const postgres_reviews = reviews.filter(
    (review) => review.product_type === paramsProduct_type,
  )

  return (
    <ProductPageClient
      product_types={product_types}
      upsellVariants={upsellVariants}
      page={page}
      postgres_reviews={postgres_reviews}
      shipping={shipping}
      paramsProduct_type={paramsProduct_type}
      paramsVariant={paramsVariant}
      postgresVariants={postgresVariants}
    />
  )
}
