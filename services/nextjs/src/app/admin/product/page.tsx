import { isSessionRSC } from '@/lib/better-auth/isSession'
import { AdminProductPageClient } from '@/app/admin/product/client/index'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { getFileNames } from '@/lib/minio'
import { getProductTypes, getBrands } from '@/utils/getPostgres'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

export default async function AdminProductPage() {
  await isSessionRSC()

  const asyncFunctions = [getProductTypes, getBrands]
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
      Awaited<ReturnType<typeof getProductTypes>>
    >
  ).value
  const brands = (
    resolved[1] as PromiseFulfilledResult<Awaited<ReturnType<typeof getBrands>>>
  ).value

  const allImagesMinio = [] as string[][]
  for (const product_type of product_types) {
    allImagesMinio.push(await getFileNames(product_type))
  }

  const imagesHomePageMinio = await getFileNames('home_page')

  return (
    <AdminProductPageClient
      productTypesPostgres={product_types}
      brandsPostgres={brands}
      allImagesMinio={allImagesMinio}
      imagesHomePageMinio={imagesHomePageMinio}
    />
  )
}
