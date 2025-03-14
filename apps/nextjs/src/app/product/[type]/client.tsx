'use client'

import { ProductRow } from '@/data/types'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { useState } from 'react'
import { AiOutlineLeftCircle, AiOutlineRightCircle } from 'react-icons/ai'

type ProductPageClientProps = {
  type: string
  defaultVersions: ProductRow[]
  defaultVersion?: string
  defaultBrands: string[]
  defaultBrand?: string
  defaultColor?: string
  defaultSize?: string
}

export function ProductPageClient({
  type,
  defaultVersions,
  defaultVersion,
  defaultBrands,
  defaultBrand,
  defaultColor,
  defaultSize,
}: ProductPageClientProps) {
  console.log(defaultVersions)

  const router = useRouter()
  const searchParams = useSearchParams()

  const [version, setVersion] = useState(defaultVersions[0])

  return (
    <>
      <Header />
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <div>
          <Image
            src={`http://minio:9000/product/${type}/${version.version}/${version.images[0]}`}
            alt={version.version}
            fill
            className="object-contain"
          />
        </div>
        <button
          onClick={() => {}}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group"
        >
          <AiOutlineLeftCircle className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
        </button>
        <button
          onClick={() => {}}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group"
        >
          <AiOutlineRightCircle className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
        </button>
      </div>
      <div className="flex gap-2 m-2">
        <button>all</button>
        {defaultBrands.map(b => (
          <button key={b}>{b}</button>
        ))}
      </div>
    </>
  )
}
