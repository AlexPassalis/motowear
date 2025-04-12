'use client'

import type { typeVariant } from '@/lib/postgres/data/type'

import HeaderProvider from '@/context/HeaderProvider'
// import { Image } from '@mantine/core'
// import NextImage from 'next/image'
// import { envClient } from '@/env'
import { typeShipping } from '@/utils/getPostgres'

type HomePageClientProps = {
  product_types: string[]
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function HomePageClient({
  product_types,
  all_variants,
  shipping,
}: HomePageClientProps) {
  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1">
        {/* <div className="relative aspect-square">
          <Image
            component={NextImage}
            src={`${envClient.MINIO_PRODUCT_URL}/pages/${img}`}
            alt={img}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div> */}
      </main>
    </HeaderProvider>
  )
}
