'use client'

import HeaderProvider from '@/context/HeaderProvider'
import type { Variants } from '@/data/type'

type CollectionPageClientProps = {
  product_types: string[]
  all_variants: Variants
  paramsProduct_type: string
  uniqueVariants: string[]
  uniqueBrands: string[]
}

export function CollectionPageClient({
  product_types,
  all_variants,
  paramsProduct_type,
  uniqueVariants,
  uniqueBrands,
}: CollectionPageClientProps) {
  console.log(paramsProduct_type)
  console.log(uniqueVariants)
  console.log(uniqueBrands)

  return (
    <HeaderProvider product_types={product_types} all_variants={all_variants}>
      <main></main>
    </HeaderProvider>
  )
}
