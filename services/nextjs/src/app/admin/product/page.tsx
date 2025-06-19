import { isSessionRSC } from '@/lib/better-auth/isSession'
import { AdminProductPageClient } from '@/app/admin/product/client/index'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { getFileNames } from '@/lib/minio'
import { getProductTypes, getBrands } from '@/utils/getPostgres'

export default async function AdminProductPage() {
  await isSessionRSC()

  const resolved = await Promise.allSettled([getProductTypes(), getBrands()])
  if (resolved[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[0].reason}`)
  }
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }

  const allImagesMinio = [] as string[][]
  for (const product_type of resolved[0].value) {
    allImagesMinio.push(await getFileNames(product_type))
  }

  const imagesHomePageMinio = await getFileNames('home_page')

  return (
    <AdminProductPageClient
      productTypesPostgres={resolved[0].value}
      brandsPostgres={resolved[1].value}
      allImagesMinio={allImagesMinio}
      imagesHomePageMinio={imagesHomePageMinio}
    />
  )
}
