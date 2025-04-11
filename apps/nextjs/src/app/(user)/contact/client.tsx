'use client'

import HeaderProvider from '@/context/HeaderProvider'
import type { typeVariant } from '@/lib/postgres/data/type'

type ContactPageClientProps = {
  product_types: string[]
  all_variants: typeVariant[]
}

export function ContactPageClient({
  product_types,
  all_variants,
}: ContactPageClientProps) {
  return (
    <HeaderProvider product_types={product_types} all_variants={all_variants}>
      <main className="flex-1">
        <h1>This is the Contact Page</h1>
      </main>
    </HeaderProvider>
  )
}
