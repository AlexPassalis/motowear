'use client'

import HeaderProvider from '@/context/HeaderProvider'

type HomePageClientProps = {
  productTypes: string[]
}

export function HomePageClient({ productTypes }: HomePageClientProps) {
  return (
    <HeaderProvider productTypes={productTypes}>
      <main>
        <h1>This is the Home Page</h1>
      </main>
    </HeaderProvider>
  )
}
