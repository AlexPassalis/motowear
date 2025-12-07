'use client'

import type {
  Collection,
  Product,
  typeProductPage,
} from '@/lib/postgres/data/type'
import type { typeBrands } from '@/utils/getPostgres'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import { ProductVariantsTable } from '@/app/admin/product/[product_type]/client/ProductVariantsTable'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { Modal } from '@/app/admin/product/[product_type]/client/Modal'
import { ProductPageComponent } from '@/app/admin/product/[product_type]/client/ProductPage'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

export type ProductWithCollectionName = Product & {
  collection_name: string
}

type AdminProductProductTypePageClientProps = {
  collection: Collection
  products: ProductWithCollectionName[]
  brands: typeBrands
  images_minio: string[]
  product_page: typeProductPage
}

export function AdminProductProductTypePageClient({
  collection: collection_postgres,
  products: product_all,
  brands,
  images_minio,
  product_page,
}: AdminProductProductTypePageClientProps) {
  const [collection, setCollection] = useState(collection_postgres)
  const [products, setProducts] = useState(
    product_all.filter((prod) => prod.collection_id === collection.id),
  )

  const [onRequest, setOnRequest] = useState(false)
  const [modalState, setModalState] = useState<typeModal>({
    type: '',
    index: 0,
  })
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false)

  return (
    <AdminProvider>
      <Modal
        collection={collection}
        setCollection={setCollection}
        images_minio={images_minio}
        products_all={product_all}
        brands_postgres={brands}
        products={products}
        setProducts={setProducts}
        modalState={modalState}
        setModalState={setModalState}
        modalOpened={modalOpened}
        closeModal={closeModal}
      />
      <ProductVariantsTable
        collection={collection}
        setCollection={setCollection}
        images_minio={images_minio}
        products={products}
        setProducts={setProducts}
        products_all={product_all}
        brands_postgres={brands}
        onRequest={onRequest}
        setOnRequest={setOnRequest}
        modalState={modalState}
        setModalState={setModalState}
        modalOpened={modalOpened}
        openModal={openModal}
        closeModal={closeModal}
      />
      <ProductPageComponent
        collection_name={collection.name}
        images_minio={images_minio}
        product_page={product_page}
        onRequest={onRequest}
        setOnRequest={setOnRequest}
      />
    </AdminProvider>
  )
}
