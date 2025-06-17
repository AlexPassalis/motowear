import { memo } from 'react'
import Link from 'next/link'
import { ROUTE_PRODUCT } from '@/data/routes'
import { LoadingOverlay } from '@mantine/core'
import Image from 'next/image'
import { envClient } from '@/env'

export const Cart = memo(CartNotMemoised)

type CartProps = {
  paramsProduct_type: string
  isLoading: boolean
  index: number
  name: string
  color: string
  image: string
  onImageLoad: (index: number) => void
}

function CartNotMemoised({
  paramsProduct_type,
  isLoading,
  index,
  name,
  color,
  image,
  onImageLoad,
}: CartProps) {
  return (
    <Link
      href={`${ROUTE_PRODUCT}/${paramsProduct_type}/${name}${
        color ? `?color=${color}` : ''
      }`}
      className="border border-[var(--mantine-border)] rounded-lg overflow-hidden"
    >
      <div className="relative aspect-square rounded-lg">
        <LoadingOverlay
          visible={isLoading}
          zIndex={50}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Image
          src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${image}`}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          priority={index < 8}
          fetchPriority={index < 8 ? 'high' : 'auto'}
          onLoad={() => onImageLoad(index)}
        />
      </div>
      <p className="text-center">{name}</p>
    </Link>
  )
}
