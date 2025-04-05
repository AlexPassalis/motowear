'use client'

import HeaderProvider from '@/context/HeaderProvider'
import type { Variants } from '@/data/type'

type HomePageClientProps = {
  product_types: string[]
  all_variants: Variants
}

export function HomePageClient({
  product_types,
  all_variants,
}: HomePageClientProps) {
  return (
    <HeaderProvider product_types={product_types} all_variants={all_variants}>
      <main>
        <h1>This is the Home Page</h1>
      </main>
    </HeaderProvider>
  )
}
