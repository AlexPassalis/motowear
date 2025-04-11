'use client'

import type { typeVariant } from '@/lib/postgres/data/type'
import HeaderProvider from '@/context/HeaderProvider'

type HomePageClientProps = {
  product_types: string[]
  all_variants: typeVariant[]
}

export function HomePageClient({
  product_types,
  all_variants,
}: HomePageClientProps) {
  return (
    <HeaderProvider product_types={product_types} all_variants={all_variants}>
      <main className="flex-1">
        <h1>This is the Home Page</h1>
      </main>
    </HeaderProvider>
  )
}
