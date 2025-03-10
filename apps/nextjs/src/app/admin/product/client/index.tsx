'use client'

import { ContextProvider } from '@/app/admin/product/client/context/Provider'
import { Dialog } from '@/app/admin/product/client/components/Dialog'
import { ProductType } from '@/app/admin/product/client/components/ProductType'
import { NewProductType } from '@/app/admin/product/client/components/NewProductType'
import { ApplyChanges } from '@/app/admin/product/client/components/ApplyChanges'
import { Product } from '@/data/types'

type AdminProductClientPageProps = {
  productPostgres: Product
}

export function AdminProductClientPage({
  productPostgres,
}: AdminProductClientPageProps) {
  return (
    <ContextProvider productPostgres={productPostgres}>
      <Dialog />
      <div className="flex flex-col justify-center items-center h-screen gap-2 text-black">
        <ProductType />
        <ApplyChanges />
        <NewProductType />
      </div>
    </ContextProvider>
  )
}
