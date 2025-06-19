'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { typeVariant } from '@/lib/postgres/data/type'
import { typeProductTypes, typeShipping } from '@/utils/getPostgres'

type UnsubscribePageClientProps = {
  email: string
  product_types: typeProductTypes
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function UnsubscribePageClient({
  email,
  product_types,
  all_variants,
  shipping,
}: UnsubscribePageClientProps) {
  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1 container mx-auto px-6 py-12 text-black">
        <h1>
          <span className="underline">{email}</span> has successfully been
          unsubscribed.
        </h1>
      </main>
    </HeaderProvider>
  )
}
