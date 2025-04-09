'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { ROUTE_PRODUCT } from '@/data/routes'
import type { Variants } from '@/data/type'
import { envClient } from '@/env'
import { SimpleGrid, Image, Pagination } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type CollectionPageClientProps = {
  paramsProduct_type: string
  product_types: string[]
  all_variants: Variants
  uniqueVariants: { image: string; name: string }[]
}

export function CollectionPageClient({
  paramsProduct_type,
  product_types,
  all_variants,
  uniqueVariants,
}: CollectionPageClientProps) {
  const [visibleVariants, setVisibleVariants] = useState(uniqueVariants)

  return (
    <HeaderProvider product_types={product_types} all_variants={all_variants}>
      <main className="flex-1 p-4 flex flex-col">
        <h1 className="text-2xl text-center mb-4">{paramsProduct_type}</h1>
        <SimpleGrid cols={2} spacing="sm" mb="md">
          {visibleVariants.map(({ name, image }, index) => (
            <Link
              key={index}
              href={`${ROUTE_PRODUCT}/${paramsProduct_type}/${name}`}
              className="border border-[var(--mantine-border)] rounded-lg overflow-hidden"
            >
              <div className="relative aspect-square rounded-lg">
                <Image
                  component={NextImage}
                  src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${image}`}
                  alt={name}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
              <p className="text-center">{name}</p>
            </Link>
          ))}
        </SimpleGrid>
        <Pagination
          total={Math.ceil(visibleVariants.length / 8)}
          onChange={pageNumber =>
            setVisibleVariants(
              uniqueVariants.slice((pageNumber - 1) * 8, pageNumber * 8)
            )
          }
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 'auto',
          }}
        />
      </main>
    </HeaderProvider>
  )
}
