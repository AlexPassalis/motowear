'use client'

import type { typeProductPage, typeVariant } from '@/lib/postgres/data/type'
import type { typeBrands } from '@/utils/getPostgres'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import { ProductVariantsTable } from '@/app/admin/product/[product_type]/client/ProductVariantsTable'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { Modal } from '@/app/admin/product/[product_type]/client/Modal'
import { ProductPageComponent } from '@/app/admin/product/[product_type]/client/ProductPage'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

type AdminProductProductTypePageClientProps = {
  product_type: string
  imagesMinio: string[]
  variantsPostgres: typeVariant[]
  brandsPostgres: typeBrands
  product_page: typeProductPage
}

export function AdminProductProductTypePageClient({
  product_type,
  imagesMinio,
  variantsPostgres,
  brandsPostgres,
  product_page,
}: AdminProductProductTypePageClientProps) {
  const [variants, setVariants] = useState(
    variantsPostgres.filter((variant) => variant.product_type === product_type),
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
        imagesMinio={imagesMinio}
        variantsPostgres={variantsPostgres}
        brandsPostgres={brandsPostgres}
        variants={variants}
        setVariants={setVariants}
        modalState={modalState}
        setModalState={setModalState}
        modalOpened={modalOpened}
        closeModal={closeModal}
      />
      <ProductVariantsTable
        product_type={product_type}
        imagesMinio={imagesMinio}
        variants={variants}
        setVariants={setVariants}
        variantsPostgres={variantsPostgres}
        brandsPostgres={brandsPostgres}
        onRequest={onRequest}
        setOnRequest={setOnRequest}
        modalState={modalState}
        setModalState={setModalState}
        modalOpened={modalOpened}
        openModal={openModal}
        closeModal={closeModal}
      />
      <ProductPageComponent
        product_type={product_type}
        product_page={product_page}
        imagesMinio={imagesMinio}
        onRequest={onRequest}
        setOnRequest={setOnRequest}
      />
    </AdminProvider>
  )
}
