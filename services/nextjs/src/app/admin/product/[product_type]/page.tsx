import { ROUTE_ERROR } from '@/data/routes'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import {
  getBrands,
  getCollection,
  getAllCollections,
  getProductPage,
  getAllProductsWithSizes,
} from '@/utils/getPostgres'
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

  const result_1 = await Promise.allSettled([
    params,
    getAllProductsWithSizes(),
    getBrands(),
    getAllCollections(),
  ])

  if (result_1[0].status === 'rejected') {
    const err = result_1[0].reason
    const location = `${ERROR.unexpected} params`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.unexpected}`)
  }

  if (result_1[1].status === 'rejected') {
    const err = result_1[1].reason
    const location = `${ERROR.postgres} getAllProductsWithSizes`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (result_1[2].status === 'rejected') {
    const err = result_1[2].reason
    const location = `${ERROR.postgres} getBrands`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (result_1[3].status === 'rejected') {
    const err = result_1[3].reason
    const location = `${ERROR.postgres} getAllCollections`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  const collection_name = decodeURIComponent(result_1[0].value.product_type)
  const products = result_1[1].value
  const brands = result_1[2].value
  const all_collections = result_1[3].value

  const result_2 = await Promise.allSettled([
    getCollection(collection_name),
    getProductPage(collection_name),
    getFileNames(collection_name),
  ])

  if (result_2[0].status === 'rejected') {
    const err = result_2[0].reason
    const location = `${ERROR.postgres} getCollection`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (result_2[1].status === 'rejected') {
    const err = result_2[1].reason
    const location = `${ERROR.postgres} getProductPage`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  if (result_2[2].status === 'rejected') {
    const err = result_2[2].reason
    const location = `${ERROR.minio} getFileNames`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.minio}`)
  }

  const collection = result_2[0].value
  const product_page = result_2[1].value
  if (!product_page) {
    notFound()
  }
  const images_minio = result_2[2].value

  return (
    <AdminProductProductTypePageClient
      key={collection.id}
      collection={collection}
      products={products}
      brands={brands}
      images_minio={images_minio}
      product_page={product_page}
      all_collections={all_collections}
    />
  )
}
