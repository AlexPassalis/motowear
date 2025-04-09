'use client'

import HeaderProvider from '@/context/HeaderProvider'
import type { Variants } from '@/data/type'
import { envClient } from '@/env'
import { SimpleGrid, Image } from '@mantine/core'
import NextImage from 'next/image'

type CollectionPageClientProps = {
  product_types: string[]
  all_variants: Variants
  paramsProduct_type: string
  uniqueVariants: { image: string; name: string }[]
}

export function CollectionPageClient({
  product_types,
  all_variants,
  paramsProduct_type,
  uniqueVariants,
}: CollectionPageClientProps) {
  return (
    <HeaderProvider product_types={product_types} all_variants={all_variants}>
      <main style={{ padding: '1rem' }}>
        <SimpleGrid cols={4} spacing="lg">
          {uniqueVariants.map(({ name, image }, index) => (
            <div
              key={`${name}-${index}`}
              className="relative aspect-square overflow-hidden"
            >
              <Image
                component={NextImage}
                src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${image}`}
                alt={name}
                fill
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </SimpleGrid>
      </main>
    </HeaderProvider>
  )
}
