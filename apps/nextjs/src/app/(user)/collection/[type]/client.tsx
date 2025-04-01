'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { ProductRow } from '@/data/types'

type CollectionPageClientProps = {
  productTypes: string[]
  paramsType: string
  postgresVersions: ProductRow[]
  uniqueBrands: string[]
  uniqueVersions: string[]
}

export function CollectionPageClient({
  productTypes,
  paramsType,
  postgresVersions,
  uniqueBrands,
  uniqueVersions,
}: CollectionPageClientProps) {
  console.log(paramsType)
  console.log(postgresVersions)
  console.log(postgresVersions)
  console.log(uniqueBrands)
  console.log(uniqueVersions)

  return (
    <HeaderProvider productTypes={productTypes}>
      <main></main>
    </HeaderProvider>
  )
}
