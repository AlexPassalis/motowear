import type {
  Collection,
  ColorVariant,
} from '@/lib/postgres/data/type'
import type { typeBrands } from '@/utils/getPostgres'

import {
  Button,
  Modal as MantineModal,
  MultiSelect,
  NumberInput,
  Textarea,
  TextInput,
} from '@mantine/core'
import { Dispatch, memo, SetStateAction, useRef } from 'react'
import { Select } from '@mantine/core'
import { colorPalette } from '@/data/colorPalette'

export type typeModal = {
  type:
    | ''
    | 'ALL_NAME'
    | 'ALL_DESCRIPTION'
    | 'ALL_IMAGES'
    | 'ALL_PRICE'
    | 'ALL_BRAND'
    | 'ALL_COLOR'
    | 'ALL_SIZE'
    | 'ALL_PRICE_BEFORE'
    | 'ALL_UPSELL'
    | 'ALL_SOLD_OUT'
    | 'COLLECTION_DESCRIPTION'
    | 'COLLECTION_SIZES'
    | 'DESCRIPTION'
    | 'COLOR'
    | 'UPSELL'
    | 'SIZE'
    | 'SIZES'
  index: number
  product_id?: string
}

export const Modal = memo(ModalNotMemoised)

type ModalProps = {
  collection: Collection
  setCollection: Dispatch<SetStateAction<Collection>>
  images_minio: string[]
  products_all: ColorVariant[]
  brands_postgres: typeBrands
  products: ColorVariant[]
  setProducts: Dispatch<SetStateAction<ColorVariant[]>>
  modalState: typeModal
  setModalState: Dispatch<SetStateAction<typeModal>>
  modalOpened: boolean
  closeModal: () => void
  all_collections: Collection[]
}

function ModalNotMemoised({
  collection,
  setCollection,
  images_minio,
  products_all,
  brands_postgres,
  products,
  setProducts,
  modalState,
  setModalState,
  modalOpened,
  closeModal,
  all_collections,
}: ModalProps) {
  const new_size_input_ref = useRef<HTMLInputElement>(null)

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

  const upsellsSelectData: { label: string; value: string }[] = []
  for (const [collection_id, collection_products] of products_by_collection) {
    const collection_name = collection_map.get(collection_id) || collection_id
    const unique_names = new Set<string>()

    for (const product of collection_products) {
      if (!product.sold_out && !unique_names.has(product.name)) {
        unique_names.add(product.name)
        upsellsSelectData.push({
          label: `${collection_name} - ${product.name}`,
          value: `${collection_name}@@${product.name}`,
        })
      }
    }
  }

  return (
    <MantineModal
      opened={modalOpened}
      onClose={() => {
        closeModal()
        setModalState({
          type: '',
          index: 0,
        })
      }}
      zIndex={1000}
      title={
        modalState.type === 'ALL_BRAND'
          ? 'Update All: Brand'
          : modalState.type === 'ALL_DESCRIPTION'
          ? 'Update All: Description'
          : modalState.type === 'ALL_PRICE'
          ? 'Update All: Price'
          : modalState.type === 'ALL_PRICE_BEFORE'
          ? 'Update All: Price Before'
          : modalState.type === 'ALL_COLOR'
          ? 'Update All: Color'
          : modalState.type === 'ALL_IMAGES'
          ? 'Update All: Images'
          : modalState.type === 'ALL_UPSELL'
          ? 'Update All: Upsell'
          : modalState.type === 'ALL_SIZE'
          ? 'Update All: Sizes'
          : modalState.type === 'ALL_SOLD_OUT'
          ? 'Update All: Sold Out'
          : modalState.type === 'COLLECTION_DESCRIPTION'
          ? 'Description: Default'
          : modalState.type === 'COLLECTION_SIZES'
          ? 'Sizes: Default'
          : modalState.type === 'SIZES' && modalState.product_id
          ? (() => {
              const product = products.find(
                (prod) => prod.id === modalState.product_id,
              )

              return `Sizes: ${product?.name || 'Product'}${
                product?.color ? ` - ${product.color}` : ''
              }`
            })()
          : modalState.product_id
          ? `Description: ${
              products.find((prod) => prod.id === modalState.product_id)
                ?.name || 'Product'
            }`
          : `Index: ${modalState.index}`
      }
      centered
    >
      <>
        {modalState.type === 'ALL_NAME' && (
          <TextInput
            placeholder="crypton-x"
            onBlur={(e) =>
              setProducts((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  name: e.target.value,
                })),
              )
            }
          />
        )}

        {modalState.type === 'ALL_DESCRIPTION' && (
          <Textarea
            placeholder="This is the product description."
            autosize
            minRows={10}
            onChange={(e) =>
              setProducts((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  description: e.target.value,
                })),
              )
            }
          />
        )}

        {modalState.type === 'ALL_IMAGES' && (
          <MultiSelect
            data={images_minio}
            onChange={(e) =>
              setProducts((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  images: e,
                })),
              )
            }
            style={{
              width: 200,
              justifySelf: 'center',
            }}
            searchable
            nothingFoundMessage="Nothing found..."
            checkIconPosition="right"
            hidePickedOptions
            maxDropdownHeight={200}
            comboboxProps={{ zIndex: 1100 }}
          />
        )}

        {modalState.type === 'ALL_PRICE' && (
          <NumberInput
            onChange={(e) =>
              setProducts((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  price: Number(e),
                })),
              )
            }
            min={0}
            max={9999.99}
            suffix="€"
          />
        )}

        {modalState.type === 'ALL_BRAND' && (
          <Select
            data={brands_postgres}
            placeholder="Yamaha"
            onChange={(value) =>
              setProducts((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  brand: value,
                })),
              )
            }
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
            comboboxProps={{ zIndex: 1100 }}
          />
        )}

        {modalState.type === 'ALL_COLOR' && (
          <Select
            data={colorPalette}
            onChange={(value) => {
              if (value) {
                setProducts((prevRows) =>
                  prevRows.map((item) => ({
                    ...item,
                    color: value,
                  })),
                )
              }
            }}
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
            comboboxProps={{ zIndex: 1100 }}
          />
        )}

        {modalState.type === 'ALL_SIZE' && (
          <>
            <MultiSelect
              data={[]}
              value={
                products.length > 0 && products[0].sizes ? products[0].sizes : []
              }
              onChange={(value) => {
                setProducts((prevRows) =>
                  prevRows.map((item) => ({
                    ...item,
                    sizes: value,
                  })),
                )
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <TextInput
                ref={new_size_input_ref}
                placeholder="Create new size"
                style={{ flex: 1 }}
              />
              <Button
                onClick={() => {
                  if (!new_size_input_ref.current) {
                    return
                  }

                  const new_size = new_size_input_ref.current.value.trim()
                  if (new_size) {
                    setProducts((prev) =>
                      prev.map((item) => ({
                        ...item,
                        sizes: [...(item.sizes || []), new_size].filter(
                          (s, idx, arr) => arr.indexOf(s) === idx,
                        ),
                      })),
                    )
                    new_size_input_ref.current.value = ''
                  }
                }}
                color="blue"
              >
                Create
              </Button>
            </div>
          </>
        )}

        {modalState.type === 'ALL_PRICE_BEFORE' && (
          <NumberInput
            onChange={(e) =>
              setProducts((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  price_before: Number(e),
                })),
              )
            }
            min={0}
            max={9999.99}
            suffix="€"
          />
        )}

        {modalState.type === 'ALL_UPSELL' && (
          <Select
            data={upsellsSelectData}
            value={
              products.every(
                (prod) =>
                  prod.upsell_collection &&
                  prod.upsell_product &&
                  prod.upsell_collection === products[0].upsell_collection &&
                  prod.upsell_product === products[0].upsell_product,
              )
                ? `${products[0].upsell_collection!}@@${products[0].upsell_product!}`
                : null
            }
            onChange={(value) => {
              if (!value) {
                setProducts((prev) => {
                  return prev.map((prod) => ({
                    ...prod,
                    upsell_collection: null,
                    upsell_product: null,
                  }))
                })

                return
              }

              const [upsell_collection, upsell_product] = value.split('@@')
              setProducts((prev) => {
                return prev.map((prod) => ({
                  ...prod,
                  upsell_collection,
                  upsell_product,
                }))
              })
            }}
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
            comboboxProps={{ zIndex: 1100 }}
          />
        )}

        {modalState.type === 'ALL_SOLD_OUT' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Button
              onClick={() => {
                setProducts((prev) =>
                  prev.map((prod) => ({ ...prod, sold_out: true })),
                )
              }}
              color="red"
            >
              Set All to Sold Out
            </Button>
            <Button
              onClick={() => {
                setProducts((prev) =>
                  prev.map((prod) => ({ ...prod, sold_out: false })),
                )
              }}
              color="green"
            >
              Set All to Available
            </Button>
          </div>
        )}

        {modalState.type === 'COLLECTION_DESCRIPTION' && (
          <Textarea
            value={collection.description || ''}
            autosize
            minRows={10}
            onChange={(e) =>
              setCollection((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="This is the collection description."
          />
        )}

        {modalState.type === 'COLLECTION_SIZES' && (
          <>
            <MultiSelect
              data={[]}
              value={collection.sizes || []}
              onChange={(value) => {
                setCollection((prev) => ({
                  ...prev,
                  sizes: value,
                }))
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <TextInput
                ref={new_size_input_ref}
                placeholder="Create new size"
                style={{ flex: 1 }}
              />
              <Button
                onClick={() => {
                  if (!new_size_input_ref.current) {
                    return
                  }

                  const new_size = new_size_input_ref.current.value.trim()
                  if (new_size && !collection.sizes?.includes(new_size)) {
                    setCollection((prev) => ({
                      ...prev,
                      sizes: [...(prev.sizes || []), new_size],
                    }))
                    new_size_input_ref.current.value = ''
                  }
                }}
                color="blue"
              >
                Create
              </Button>
            </div>
          </>
        )}

        {modalState.type === 'SIZES' && modalState.product_id && (
          <>
            <MultiSelect
              data={[]}
              value={
                products.find((prod) => prod.id === modalState.product_id)
                  ?.sizes || []
              }
              onChange={(value) => {
                setProducts((prev) =>
                  prev.map((item) =>
                    item.id === modalState.product_id
                      ? { ...item, sizes: value }
                      : item,
                  ),
                )
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <TextInput
                ref={new_size_input_ref}
                placeholder="Create new size"
                style={{ flex: 1 }}
              />
              <Button
                onClick={() => {
                  if (!new_size_input_ref.current) {
                    return
                  }

                  const new_size = new_size_input_ref.current.value.trim()
                  const current_product = products.find(
                    (prod) => prod.id === modalState.product_id,
                  )
                  if (
                    new_size &&
                    current_product &&
                    !current_product.sizes?.includes(new_size)
                  ) {
                    setProducts((prev) =>
                      prev.map((item) =>
                        item.id === modalState.product_id
                          ? {
                              ...item,
                              sizes: [...(item.sizes || []), new_size],
                            }
                          : item,
                      ),
                    )
                    new_size_input_ref.current.value = ''
                  }
                }}
                color="blue"
              >
                Create
              </Button>
            </div>
          </>
        )}

        {modalState.type === 'DESCRIPTION' && modalState.product_id && (
          <Textarea
            value={
              products.find((prod) => prod.id === modalState.product_id)
                ?.description || ''
            }
            autosize
            minRows={10}
            onChange={(e) =>
              setProducts((prevRows) =>
                prevRows.map((item) =>
                  item.id === modalState.product_id
                    ? { ...item, description: e.target.value }
                    : item,
                ),
              )
            }
            placeholder="This is the product description."
          />
        )}

        {modalState.type === 'COLOR' && (
          <Select
            data={colorPalette}
            defaultValue={products[modalState.index].color}
            onChange={(value) => {
              if (value) {
                setProducts((prevRows) =>
                  prevRows.map((item, idx) =>
                    idx === modalState.index ? { ...item, color: value } : item,
                  ),
                )
              }
            }}
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
            comboboxProps={{ zIndex: 1100 }}
          />
        )}

        {modalState.type === 'UPSELL' && modalState.product_id && (
          <Select
            data={upsellsSelectData}
            value={(() => {
              const product = products.find(
                (prod) => prod.id === modalState.product_id,
              )

              if (
                !product ||
                !product.upsell_collection ||
                !product.upsell_product
              ) {
                return null
              }

              return `${product.upsell_collection}@@${product.upsell_product}`
            })()}
            onChange={(value) => {
              if (!value) {
                setProducts((prev) =>
                  prev.map((prod) =>
                    prod.id === modalState.product_id
                      ? {
                          ...prod,
                          upsell_collection: null,
                          upsell_product: null,
                        }
                      : prod,
                  ),
                )

                return
              }

              const [upsell_collection, upsell_product] = value.split('@@')
              setProducts((prev) =>
                prev.map((prod) =>
                  prod.id === modalState.product_id
                    ? { ...prod, upsell_collection, upsell_product }
                    : prod,
                ),
              )
            }}
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
            comboboxProps={{ zIndex: 1100 }}
          />
        )}
      </>
    </MantineModal>
  )
}
