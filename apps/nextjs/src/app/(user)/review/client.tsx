'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { typeOrder, typeVariant } from '@/lib/postgres/data/type'
import { typeProductTypes, typeShipping } from '@/utils/getPostgres'

type ReviewPageClientProps = {
  order: typeOrder
  product_types: typeProductTypes
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function ReviewPageClient({
  order,
  product_types,
  all_variants,
  shipping,
}: ReviewPageClientProps) {
  console.log(order)

  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1 container mx-auto px-6 py-12 prose prose-lg text-gray-800"></main>
    </HeaderProvider>
  )
}
