'use client'

import { ProductRow } from '@/data/types'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { useState } from 'react'
import { AiOutlineLeftCircle, AiOutlineRightCircle } from 'react-icons/ai'

type ProductPageClientProps = {
  productTypes: string[]
  type: string
  uniqueBrands: string[]
  uniqueVersions: string[]
  defaultVersions: ProductRow[]
}

export function ProductPageClient({
  productTypes,
  type,
  uniqueBrands,
  uniqueVersions,
  defaultVersions,
}: ProductPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [version, setVersion] = useState(defaultVersions[0])

  return (
    <>
      <Header productTypes={productTypes} />
      <div className="relative w-full h-[500px]">
        <Image
          src={`http://minio:9000/product/${type}/${version.version}/${version.images[0]}`}
          alt={version.version}
          fill
          priority
        />
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
      <div className="flex gap-4 p-8">
        {uniqueBrands.length > 0 && (
          <>
            <label htmlFor="brands">Filter versions by brand: </label>
            <select id="brands">
              <option value={'-'} className="text-center">
                -
              </option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </>
        )}
        <label htmlFor="versions">Find version: </label>
        <select id="versions">
          {uniqueVersions.map(version => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
