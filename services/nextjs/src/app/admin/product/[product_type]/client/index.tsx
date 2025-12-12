'use client'

import type {
  Collection,
  ColorVariant,
  typeProductPage,
} from '@/lib/postgres/data/type'
import type { typeBrands } from '@/utils/getPostgres'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import { ProductNamesTable } from '@/app/admin/product/[product_type]/client/ProductNamesTable'
import { ColorVariantsModal } from '@/app/admin/product/[product_type]/client/ColorVariantsModal'
import { useState, useEffect, useMemo } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { Modal } from '@/app/admin/product/[product_type]/client/Modal'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

type AdminProductProductTypePageClientProps = {
  collection: Collection
  products: ColorVariant[]
  brands: typeBrands
  images_minio: string[]
  product_page: typeProductPage
  all_collections: Collection[]
}

export function AdminProductProductTypePageClient({
  collection: collection_postgres,
  products: product_all,
  brands,
  images_minio,
  product_page,
  all_collections,
}: AdminProductProductTypePageClientProps) {
  const [collection, setCollection] = useState(collection_postgres)
  const initial_products = useMemo(
    () => product_all.filter((prod) => prod.collection_id === collection.id),
    [product_all, collection.id],
  )
  const [products, setProducts] = useState<ColorVariant[]>(initial_products)

  const [onRequest, setOnRequest] = useState(false)
  const [modalState, setModalState] = useState<typeModal>({
    type: '',
    index: 0,
  })
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false)

  const [selected_product_name, set_selected_product_name] = useState<
    string | null
  >(null)
  const [color_variants, set_color_variants] = useState<ColorVariant[]>([])
  const [
    color_variants_modal_opened,
    { open: open_color_variants_modal, close: close_color_variants_modal },
  ] = useDisclosure(false)
  const [go_to_last_page_trigger, set_go_to_last_page_trigger] = useState(0)

  useEffect(() => {
    if (selected_product_name) {
      const updated_variants = products.filter(
        (p) => p.name === selected_product_name,
      )
      if (updated_variants.length > 0) {
        set_color_variants(updated_variants)
      }
    }
  }, [products, selected_product_name])

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
        all_collections={all_collections}
      />
      <ColorVariantsModal
        opened={color_variants_modal_opened}
        close={close_color_variants_modal}
        selected_product_name={selected_product_name}
        color_variants={color_variants}
        setColorVariants={(update) => {
          if (typeof update === 'function') {
            const updated = update(color_variants)
            set_color_variants(updated)
            setProducts((prev) => {
              const other_products = prev.filter(
                (p) => p.name !== selected_product_name,
              )

              return [...other_products, ...updated]
            })
          } else {
            set_color_variants(update)
            setProducts((prev) => {
              const other_products = prev.filter(
                (p) => p.name !== selected_product_name,
              )

              return [...other_products, ...update]
            })
          }
        }}
        collection={collection}
        images_minio={images_minio}
        brands_postgres={brands}
        products_all={product_all}
        all_collections={all_collections}
        setModalState={setModalState}
        openModal={openModal}
        onRequest={onRequest}
        triggerGoToLastPage={() => {
          set_go_to_last_page_trigger((prev) => prev + 1)
        }}
      />
      <ProductNamesTable
        collection={collection}
        collection_postgres={collection_postgres}
        setCollection={setCollection}
        images_minio={images_minio}
        products={products}
        products_postgres={initial_products}
        setProducts={setProducts}
        products_all={product_all}
        onRequest={onRequest}
        setOnRequest={setOnRequest}
        modalState={modalState}
        setModalState={setModalState}
        modalOpened={modalOpened}
        openModal={openModal}
        closeModal={closeModal}
        color_variants_modal_opened={color_variants_modal_opened}
        open_color_variants_modal={open_color_variants_modal}
        close_color_variants_modal={close_color_variants_modal}
        selected_product_name={selected_product_name}
        set_selected_product_name={set_selected_product_name}
        color_variants={color_variants}
        set_color_variants={set_color_variants}
        product_page={product_page}
        all_collections={all_collections}
        go_to_last_page_trigger={go_to_last_page_trigger}
      />
    </AdminProvider>
  )
}
