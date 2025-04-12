'use client'

import type { typeShipping } from '@/utils/getPostgres'
import type { typeVariant } from '@/lib/postgres/data/type'

import HeaderProvider from '@/context/HeaderProvider'

type ContactPageClientProps = {
  product_types: string[]
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function ContactPageClient({
  product_types,
  all_variants,
  shipping,
}: ContactPageClientProps) {
  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1">
        <h1>This is the Contact Page</h1>
      </main>
    </HeaderProvider>
  )
}
