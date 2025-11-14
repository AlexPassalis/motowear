import { ROUTE_ERROR } from '@/data/routes'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import { getBrands, getProductPage, getVariants } from '@/utils/getPostgres'
import { notFound, redirect } from 'next/navigation'
import { AdminProductProductTypePageClient } from '@/app/admin/product/[product_type]/client/index'
import { getFileNames } from '@/lib/minio'

type AdminProductsProductTypePageProps = {
  params: Promise<{ product_type: string }>
}

export default async function AdminProductProductTypePage({
  params,
}: AdminProductsProductTypePageProps) {
  await isSessionRSC()

  const resolvedFirst = await Promise.allSettled([
    params,
    getVariants(),
    getBrands(),
  ])
  if (
    resolvedFirst[1].status === 'rejected' ||
    resolvedFirst[2].status === 'rejected'
  ) {
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }
  const product_type = decodeURIComponent(
    (resolvedFirst[0] as PromiseFulfilledResult<{ product_type: string }>).value
      .product_type,
  )

  const resolvedSecond = await Promise.allSettled([
    getFileNames(product_type),
    getProductPage(product_type),
  ])
  if (resolvedSecond[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=MINIO`)
  }
  if (resolvedSecond[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }

  if (!resolvedSecond[1].value) {
    notFound()
  }

  return (
    <AdminProductProductTypePageClient
      product_type={product_type}
      variantsPostgres={resolvedFirst[1].value}
      brandsPostgres={resolvedFirst[2].value}
      imagesMinio={resolvedSecond[0].value}
      product_page={resolvedSecond[1].value}
    />
  )
}
