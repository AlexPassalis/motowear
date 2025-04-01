'use client'

import HeaderProvider from '@/context/HeaderProvider'

type ContactPageClientProps = {
  productTypes: string[]
}

export function ContactPageClient({ productTypes }: ContactPageClientProps) {
  return (
    <HeaderProvider productTypes={productTypes}>
      <main>
        <h1>This is the Contact Page</h1>
      </main>
    </HeaderProvider>
  )
}
