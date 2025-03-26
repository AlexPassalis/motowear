import { ProductRow } from '@/data/types'
import { postgres } from '@/lib/postgres'
import { ProductPageClient } from '@/app/(user)/product/[type]/client'
import { getProductTypes } from '@/utils/getPostgres'
import { notFound } from 'next/navigation'

type ProductPageProps = {
  params: Promise<{
    type: string
  }>
  searchParams: Promise<{ [version: string]: string | undefined }>
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const [resolvedParams, resolvedSearchParams, productTypes] =
    await Promise.all([params, searchParams, getProductTypes()])

  const paramsType = decodeURIComponent(resolvedParams.type)
  const searchParamsVersion = resolvedSearchParams['version']
    ? decodeURIComponent(resolvedSearchParams['version'])
    : undefined

  if (!searchParamsVersion) {
    return notFound()
  }

  let postgresVersions: ProductRow[]
  try {
    const { rows }: { rows: ProductRow[] } = await postgres.execute(
      `SELECT * FROM product."${paramsType}"`
    )
    postgresVersions = rows
  } catch (e: any) {
    if (e.code === '42P01') {
      return notFound()
    } else {
      throw e
    }
  }

  const uniqueBrands = Array.from(
    new Set(
      postgresVersions
        .map(row => row.brand)
        .filter((b): b is string => b !== null)
    )
  )
  const uniqueVersions = Array.from(
    new Set(postgresVersions.map(row => row.version))
  )

  return (
    <ProductPageClient
      paramsType={paramsType}
      searchParamsVersion={searchParamsVersion}
      productTypes={productTypes}
      postgresVersions={postgresVersions}
      uniqueBrands={uniqueBrands}
      uniqueVersions={uniqueVersions}
    />
  )
}
