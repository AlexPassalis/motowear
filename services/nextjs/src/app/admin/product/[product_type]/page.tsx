import { ROUTE_ERROR } from '@/data/routes'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import { getBrands, getProductPage, getVariants } from '@/utils/getPostgres'
import { notFound, redirect } from 'next/navigation'
import { AdminProductProductTypePageClient } from '@/app/admin/product/[product_type]/client/index'
import { getFileNames } from '@/lib/minio'

import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

type AdminProductsProductTypePageProps = {
  params: Promise<{ product_type: string }>
}

export default async function AdminProductProductTypePage({
  params,
}: AdminProductsProductTypePageProps) {
  await isSessionRSC()

  const asyncFunctions = [getVariants, getBrands]
  const resolvedFirst = await Promise.allSettled([
    params,
    ...asyncFunctions.map((asyncFunction) => asyncFunction()),
  ])
  resolvedFirst.forEach((result, index) => {
    if (result.status === 'rejected') {
      if (index > 0) {
        const location = `${ERROR.postgres} ${asyncFunctions[index - 1].name}`
        const err = result.reason
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
      }
    }
  })

  const resolved_params = (
    resolvedFirst[0] as PromiseFulfilledResult<{ product_type: string }>
  ).value
  const variants = (
    resolvedFirst[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getVariants>>
    >
  ).value
  const brands = (
    resolvedFirst[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getBrands>>
    >
  ).value

  const product_type = decodeURIComponent(resolved_params.product_type)

  const resolvedSecond = await Promise.allSettled([
    getFileNames(product_type),
    getProductPage(product_type),
  ])
  resolvedSecond.forEach((result, index) => {
    if (result.status === 'rejected') {
      const err = result.reason
      if (index === 0) {
        const location = `${ERROR.minio} getFileNames`
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.minio}`)
      } else {
        const location = `${ERROR.postgres} getProductPage`
        handleError(location, err)

        redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
      }
    }
  })

  const images_minio = (
    resolvedSecond[0] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getFileNames>>
    >
  ).value
  const product_page = (
    resolvedSecond[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getProductPage>>
    >
  ).value

  if (!product_page) {
    notFound()
  }

  return (
    <AdminProductProductTypePageClient
      product_type={product_type}
      variantsPostgres={variants}
      brandsPostgres={brands}
      imagesMinio={images_minio}
      product_page={product_page}
    />
  )
}
