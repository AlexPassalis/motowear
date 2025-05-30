'use client'

import type { typeProductTypes, typeBrands } from '@/utils/getPostgres'

import { useState } from 'react'
import { NewProductType } from '@/app/admin/product/client/NewProductType'
import { Home } from '@/app/admin/product/client/Home'
import { BrandsComponent } from '@/app/admin/product/client/Brands'
import { ProductType } from '@/app/admin/product/client/ProductType'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

type AdminProductPageClientProps = {
  productTypesPostgres: typeProductTypes
  brandsPostgres: typeBrands
  allImagesMinio: string[][]
  imagesHomePageMinio: string[]
}

export function AdminProductPageClient({
  productTypesPostgres,
  brandsPostgres,
  allImagesMinio,
  imagesHomePageMinio,
}: AdminProductPageClientProps) {
  const [onRequest, setOnRequest] = useState(false)

  return (
    <AdminProvider>
      <div className="flex flex-col items-center p-4 gap-4 text-black">
        <Home
          imagesHomePageMinio={imagesHomePageMinio}
          onRequest={onRequest}
          setOnRequest={setOnRequest}
        />
        <BrandsComponent
          brandsPostgres={brandsPostgres}
          onRequest={onRequest}
          setOnRequest={setOnRequest}
        />
        {productTypesPostgres.map((product_type, index) => (
          <ProductType
            key={index}
            product_type={product_type}
            imagesMinio={allImagesMinio[index]}
            onRequest={onRequest}
            setOnRequest={setOnRequest}
          />
        ))}
        <NewProductType
          productTypesPostgres={productTypesPostgres}
          onRequest={onRequest}
          setOnRequest={setOnRequest}
        />
      </div>
    </AdminProvider>
  )
}
