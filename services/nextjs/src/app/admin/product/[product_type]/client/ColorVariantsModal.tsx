import type { ColorVariant, Collection } from '@/lib/postgres/data/type'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import { Modal, Table, Button, Group, TextInput, Select, MultiSelect } from '@mantine/core'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { ColorVariantRow } from '@/app/admin/product/[product_type]/client/ColorVariantRow'
import { v4 as id } from 'uuid'

type ColorVariantsModalProps = {
  opened: boolean
  close: () => void
  selected_product_name: string | null
  color_variants: ColorVariant[]
  setColorVariants: Dispatch<SetStateAction<ColorVariant[]>>
  collection: Collection
  images_minio: string[]
  brands_postgres: string[]
  products_all: ColorVariant[]
  all_collections: Collection[]
  setModalState: Dispatch<SetStateAction<typeModal>>
  openModal: () => void
  onRequest: boolean
  triggerGoToLastPage: () => void
}

export function ColorVariantsModal({
  opened,
  close,
  selected_product_name,
  color_variants,
  setColorVariants,
  collection,
  images_minio,
  brands_postgres,
  products_all,
  all_collections,
  setModalState,
  openModal,
  onRequest,
  triggerGoToLastPage,
}: ColorVariantsModalProps) {
  const [copy_name, set_copy_name] = useState('')
  const [copy_brand, set_copy_brand] = useState<string | null>(null)
  const [copy_images, set_copy_images] = useState<string[]>([])

  const upsells_select_data = useMemo(() => {
    const collection_map = new Map<string, string>()
    for (const coll of all_collections) {
      collection_map.set(coll.id, coll.name)
    }

    const products_by_collection = new Map<string, ColorVariant[]>()

    for (const product of products_all) {
      if (!products_by_collection.has(product.collection_id)) {
        products_by_collection.set(product.collection_id, [])
      }
      products_by_collection.get(product.collection_id)!.push(product)
    }

    const options: { label: string; value: string }[] = []

    for (const [collection_id, collection_products] of products_by_collection) {
      const collection_name = collection_map.get(collection_id) || collection_id

      const unique_names = new Set<string>()

      for (const product of collection_products) {
        if (!product.sold_out && !unique_names.has(product.name)) {
          unique_names.add(product.name)
          options.push({
            label: `${collection_name} - ${product.name}`,
            value: `${collection_name}::${product.name}`,
          })
        }
      }
    }

    return options
  }, [products_all, all_collections])

  function handle_add_color() {
    const new_color_variant: ColorVariant = {
      id: '',
      collection_id: collection.id,
      name: selected_product_name!,
      brand: color_variants[0]?.brand || null,
      description: null,
      price: null,
      price_before: null,
      color: null,
      images: [],
      upsell_collection: null,
      upsell_product: null,
      sold_out: false,
      sizes: [],
    }

    setColorVariants([...color_variants, new_color_variant])
  }

  function handle_create_copy() {
    if (!copy_name.trim()) {
      alert('Please enter a product name for the copy')

      return
    }

    const new_variants = color_variants.map((variant) => {
      const new_variant: ColorVariant = {
        id: '',
        collection_id: collection.id,
        name: copy_name.trim(),
        brand: copy_brand || variant.brand,
        description: variant.description,
        price: variant.price,
        price_before: variant.price_before,
        color: variant.color,
        images: copy_images.length > 0 ? copy_images : variant.images,
        upsell_collection: variant.upsell_collection,
        upsell_product: variant.upsell_product,
        sold_out: variant.sold_out,
        sizes: variant.sizes,
      }

      return new_variant
    })

    setColorVariants((prev) => [...prev, ...new_variants])

    set_copy_name('')
    set_copy_brand(null)
    set_copy_images([])

    close()
    triggerGoToLastPage()
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`Edit Colors: ${selected_product_name}`}
      size="99%"
      styles={{
        body: { padding: '20px' },
      }}
      zIndex={300}
    >
      <Table.ScrollContainer minWidth={1200}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ textAlign: 'center' }}>Name</Table.Th>
              <Table.Th
                style={{ textAlign: 'center', cursor: 'pointer' }}
                className="hover:!text-green-600 transition-colors"
                onClick={() => {
                  setModalState({
                    type: 'ALL_BRAND',
                    index: 0,
                  })
                  openModal()
                }}
              >
                Brand
              </Table.Th>
              <Table.Th
                style={{ textAlign: 'center', cursor: 'pointer' }}
                className="hover:!text-green-600 transition-colors"
                onClick={() => {
                  setModalState({
                    type: 'ALL_DESCRIPTION',
                    index: 0,
                  })
                  openModal()
                }}
              >
                Description
              </Table.Th>
              <Table.Th
                style={{ textAlign: 'center', cursor: 'pointer' }}
                className="hover:!text-green-600 transition-colors"
                onClick={() => {
                  setModalState({
                    type: 'ALL_PRICE',
                    index: 0,
                  })
                  openModal()
                }}
              >
                Price
              </Table.Th>
              <Table.Th
                style={{ textAlign: 'center', cursor: 'pointer' }}
                className="hover:!text-green-600 transition-colors"
                onClick={() => {
                  setModalState({
                    type: 'ALL_PRICE_BEFORE',
                    index: 0,
                  })
                  openModal()
                }}
              >
                Price Before
              </Table.Th>
              <Table.Th
                style={{ textAlign: 'center', cursor: 'pointer' }}
                className="hover:!text-green-600 transition-colors"
                onClick={() => {
                  setModalState({
                    type: 'ALL_COLOR',
                    index: 0,
                  })
                  openModal()
                }}
              >
                Color
              </Table.Th>
              <Table.Th
                style={{ textAlign: 'center', cursor: 'pointer' }}
                className="hover:!text-green-600 transition-colors"
                onClick={() => {
                  setModalState({
                    type: 'ALL_IMAGES',
                    index: 0,
                  })
                  openModal()
                }}
              >
                Images
              </Table.Th>
              <Table.Th
                style={{ textAlign: 'center', cursor: 'pointer' }}
                className="hover:!text-green-600 transition-colors"
                onClick={() => {
                  setModalState({
                    type: 'ALL_UPSELL',
                    index: 0,
                  })
                  openModal()
                }}
              >
                Upsell
              </Table.Th>
              <Table.Th
                style={{ textAlign: 'center', cursor: 'pointer' }}
                className="hover:!text-green-600 transition-colors"
                onClick={() => {
                  setModalState({
                    type: 'ALL_SIZE',
                    index: 0,
                  })
                  openModal()
                }}
              >
                Sizes
              </Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Sold Out</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {color_variants.map((variant) => (
              <ColorVariantRow
                key={variant.id || id()}
                collection={collection}
                images_minio={images_minio}
                brands_postgres={brands_postgres}
                variant={variant}
                color_variants={color_variants}
                setColorVariants={setColorVariants}
                upsells_select_data={upsells_select_data}
                setModalState={setModalState}
                openModal={openModal}
                onRequest={onRequest}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group mt="md" justify="center">
        <Button onClick={handle_add_color} disabled={onRequest} color="blue">
          Add Color
        </Button>
      </Group>

      <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #dee2e6', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', textAlign: 'center' }}>Create Copy</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <TextInput
            label="Product Name"
            placeholder="Enter new product name"
            value={copy_name}
            onChange={(e) => {
              set_copy_name(e.target.value)
            }}
            style={{ flex: 1 }}
            disabled={onRequest}
          />
          <Select
            label="Brand (optional)"
            data={brands_postgres}
            value={copy_brand}
            onChange={set_copy_brand}
            searchable
            clearable
            placeholder="Use current brand"
            style={{ flex: 1 }}
            disabled={onRequest}
          />
          <MultiSelect
            label="Images (optional)"
            data={images_minio}
            value={copy_images}
            onChange={set_copy_images}
            searchable
            placeholder="Use current images"
            style={{ flex: 1 }}
            disabled={onRequest}
          />
          <Button onClick={handle_create_copy} disabled={onRequest} color="blue">
            Create Copy
          </Button>
        </div>
      </div>
    </Modal>
  )
}
