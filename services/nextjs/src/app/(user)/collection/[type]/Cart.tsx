import { memo } from 'react'
import Link from 'next/link'
import { ROUTE_PRODUCT } from '@/data/routes'
import { LoadingOverlay } from '@mantine/core'
import Image from 'next/image'
import { envClient } from '@/envClient'

export const Cart = memo(CartNotMemoised)

type CartProps = {
  collection: string
  isLoading: boolean
  index: number
  name: string
  image: string
  onImageLoad: (index: number) => void
}

function CartNotMemoised({
  collection,
  isLoading,
  index,
  name,
  image,
  onImageLoad,
}: CartProps) {
  return (
    <Link
      href={`${ROUTE_PRODUCT}/${collection}/${name}`}
      className="border border-[var(--mantine-border)] rounded-lg overflow-hidden"
    >
      <div className="relative aspect-square rounded-lg">
        <LoadingOverlay
          visible={isLoading}
          zIndex={50}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Image
          src={`${envClient.MINIO_PRODUCT_URL}/${collection}/${image}`}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          priority={index < 8}
          fetchPriority={index < 8 ? 'high' : 'auto'}
          onLoad={() => onImageLoad(index)}
          onError={() => onImageLoad(index)}
        />
      </div>
      <p className="text-center">{name}</p>
    </Link>
  )
}
