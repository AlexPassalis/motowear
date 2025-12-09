import type { ColorVariant, Collection, ProductNameGroup, typeProductPage } from '@/lib/postgres/data/type'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import { zodProducts } from '@/lib/postgres/data/zod'
import { z } from 'zod'

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Button,
  NumberInput,
  Pagination,
  Select,
  Table,
  TextInput,
} from '@mantine/core'
import { envClient } from '@/envClient'
import axios from 'axios'
import { ProductNameRow } from '@/app/admin/product/[product_type]/client/ProductNameRow'
import { ProductPageComponent } from '@/app/admin/product/[product_type]/client/ProductPage'
import { normalise } from '@/utils/normalise'
import { ERROR } from '@/data/magic'
import { group_products_by_name } from '@/utils/groupProducts'
import { v4 as id } from 'uuid'

type ProductNamesTableProps = {
  collection: Collection
  collection_postgres: Collection
  setCollection: Dispatch<SetStateAction<Collection>>
  images_minio: string[]
  products_all: ColorVariant[]
  brands_postgres: string[]
  products: ColorVariant[]
  products_postgres: ColorVariant[]
  setProducts: Dispatch<SetStateAction<ColorVariant[]>>
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
  modalState: typeModal
  setModalState: Dispatch<SetStateAction<typeModal>>
  modalOpened: boolean
  openModal: () => void
  closeModal: () => void
  color_variants_modal_opened: boolean
  open_color_variants_modal: () => void
  close_color_variants_modal: () => void
  selected_product_name: string | null
  set_selected_product_name: Dispatch<SetStateAction<string | null>>
  color_variants: ColorVariant[]
  set_color_variants: Dispatch<SetStateAction<ColorVariant[]>>
  product_page: typeProductPage
  all_collections: Collection[]
  go_to_last_page_trigger: number
}

export function ProductNamesTable({
  collection,
  collection_postgres,
  setCollection,
  images_minio,
  products_all,
  brands_postgres,
  products,
  products_postgres,
  setProducts,
  onRequest,
  setOnRequest,
  setModalState,
  openModal,
  open_color_variants_modal,
  set_selected_product_name,
  set_color_variants,
  product_page,
  all_collections,
  go_to_last_page_trigger,
}: ProductNamesTableProps) {
  const [search_query, set_search_query] = useState('')

  const pagination_page_size = 25
  const [page_number, set_page_number] = useState(1)

  const product_name_groups = useMemo(() => {
    return group_products_by_name(
      products.map((p) => ({ ...p, collection_name: collection.name }))
    )
  }, [products, collection.name])

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

  const filtered_groups = useMemo(() => {
    if (!search_query) {
      return product_name_groups
    }

    return product_name_groups.filter((group) =>
      normalise(group.name).includes(normalise(search_query)),
    )
  }, [product_name_groups, search_query])

  const visible_groups = useMemo(() => {
    return filtered_groups.slice(
      (page_number - 1) * pagination_page_size,
      page_number * pagination_page_size,
    )
  }, [filtered_groups, page_number])

  const total_pages = Math.max(
    1,
    Math.ceil(filtered_groups.length / pagination_page_size),
  )

  useEffect(() => {
    set_page_number((prev_page_number) =>
      Math.min(Math.max(1, prev_page_number), total_pages),
    )
  }, [total_pages])

  useEffect(() => {
    set_page_number(1)
  }, [search_query])

  useEffect(() => {
    if (go_to_last_page_trigger > 0) {
      go_to_last_page()
    }
  }, [go_to_last_page_trigger])

  function handle_group_click(group: ProductNameGroup) {
    const variants_for_product = products.filter(
      (p) => p.name === group.name && p.collection_id === group.collection_id
    )

    set_selected_product_name(group.name)
    set_color_variants(variants_for_product)
    open_color_variants_modal()
  }

  function go_to_last_page() {
    const groups = group_products_by_name(
      products.map((p) => ({ ...p, collection_name: collection.name }))
    )
    const last_page = Math.max(
      1,
      Math.ceil(groups.length / pagination_page_size)
    )
    set_page_number(last_page)
  }

  function handle_create_new_product() {
    const existing_new_products = products.filter((p) =>
      p.name.startsWith('New Product')
    )
    const new_number = existing_new_products.length + 1
    const new_name = `New Product ${new_number}`

    const new_product: ColorVariant = {
      id: '',
      collection_id: collection.id,
      name: new_name,
      brand: null,
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

    const updated_products = [...products, new_product]
    setProducts(updated_products)

    const new_groups = group_products_by_name(
      updated_products.map((p) => ({ ...p, collection_name: collection.name }))
    )
    const last_page = Math.max(
      1,
      Math.ceil(new_groups.length / pagination_page_size)
    )
    set_page_number(last_page)
  }

  const collection_has_changed = useMemo(() => {
    return JSON.stringify(collection) !== JSON.stringify(collection_postgres)
  }, [collection, collection_postgres])

  const products_have_changed = useMemo(() => {
    return JSON.stringify(products) !== JSON.stringify(products_postgres)
  }, [products, products_postgres])

  async function handle_save_collection() {
    setOnRequest(true)

    try {
      const res = await axios.post(
        `${envClient.API_ADMIN_URL}/product/collection`,
        {
          collection,
        },
      )

      if (res.status === 200) {
        window.location.reload()
      } else {
        alert(`Error saving collection: ${res.data?.message || ERROR.unexpected}`)
        console.error(res)
      }
    } catch (err) {
      alert('Error saving collection')
      console.error(err)
    }

    setOnRequest(false)
  }

  function update_collection(updates: Partial<Collection>) {
    setCollection((prev) => ({ ...prev, ...updates }))
  }

  return (
    <>
      <div className="m-4 text-center">
        <h1 className="text-3xl font-bold">{collection.name}</h1>
      </div>

      <ProductPageComponent
        collection_name={collection.name}
        images_minio={images_minio}
        product_page={product_page}
        onRequest={onRequest}
        setOnRequest={setOnRequest}
      />

      <Table.ScrollContainer
        minWidth={420}
        style={{ minHeight: '200px' }}
        className="border border-neutral-300 rounded-lg bg-white m-4"
      >
        <Table key={`${collection.name}-defaults`} miw={700}>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: 'none' }}>
              <Table.Th
                colSpan={6}
                style={{ textAlign: 'center' }}
                className="text-2xl font-bold"
              >
                Defaults
              </Table.Th>
            </Table.Tr>

            <Table.Tr>
              <Table.Th style={{ textAlign: 'center' }}>Description</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Price</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Price Before</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Sizes</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Upsell</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Sold Out</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            <Table.Tr>
              <Table.Td style={{ textAlign: 'center' }}>
                <Button
                  onClick={() => {
                    setModalState({
                      type: 'COLLECTION_DESCRIPTION',
                      index: 0,
                    })
                    openModal()
                  }}
                  color="blue"
                  disabled={onRequest}
                >
                  {collection.description && collection.description.length > 0
                    ? '...'
                    : 'Add'}
                </Button>
              </Table.Td>

              <Table.Td>
                <NumberInput
                  value={collection.price}
                  onChange={(e) => {
                    update_collection({ price: Number(e) })
                  }}
                  min={0}
                  max={9999.99}
                  suffix="€"
                  disabled={onRequest}
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  value={collection.price_before || undefined}
                  onChange={(e) => {
                    update_collection({ price_before: e ? Number(e) : null })
                  }}
                  min={0}
                  max={9999.99}
                  suffix="€"
                  disabled={onRequest}
                />
              </Table.Td>

              <Table.Td style={{ textAlign: 'center' }}>
                <Button
                  onClick={() => {
                    setModalState({
                      type: 'COLLECTION_SIZES',
                      index: 0,
                    })
                    openModal()
                  }}
                  color="blue"
                  disabled={onRequest}
                >
                  {collection.sizes && collection.sizes.length > 0 ? collection.sizes.length : ''}
                </Button>
              </Table.Td>

              <Table.Td>
                <Select
                  data={upsells_select_data}
                  value={
                    collection.upsell_collection && collection.upsell_product
                      ? `${collection.upsell_collection}::${collection.upsell_product}`
                      : null
                  }
                  onChange={(value) => {
                    if (value) {
                      const parts = value.split('::')
                      if (parts.length === 2) {
                        update_collection({
                          upsell_collection: parts[0],
                          upsell_product: parts[1],
                        })
                      }
                    } else {
                      update_collection({
                        upsell_collection: null,
                        upsell_product: null,
                      })
                    }
                  }}
                  placeholder="Select upsell"
                  searchable
                  clearable
                  disabled={onRequest}
                />
              </Table.Td>

              <Table.Td style={{ textAlign: 'center' }}>
                <Button
                  onClick={() => {
                    update_collection({ sold_out: !collection.sold_out })
                  }}
                  color={collection.sold_out ? 'red' : 'green'}
                  disabled={onRequest}
                >
                  {collection.sold_out ? 'Yes' : 'No'}
                </Button>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>

          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={6}>
                <div className="flex justify-center">
                  <Button
                    onClick={handle_save_collection}
                    disabled={!collection_has_changed || onRequest}
                    color="green"
                  >
                    {onRequest ? 'Wait ...' : 'Apply changes'}
                  </Button>
                </div>
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Table.ScrollContainer>

      <Table.ScrollContainer
        minWidth={420}
        style={{ minHeight: '200px' }}
        className="border border-neutral-300 rounded-lg bg-white m-4"
      >
        <Table key={`${collection.name}-products`} miw={700}>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: 'none' }}>
              <Table.Th
                colSpan={8}
                style={{ textAlign: 'center' }}
                className="text-2xl font-bold"
              >
                Products
              </Table.Th>
            </Table.Tr>

            <Table.Tr>
              <Table.Th style={{ textAlign: 'center' }}>Product Name</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Color Count</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody style={{ borderBottom: '1px solid #dee2e6' }}>
            {visible_groups.map((group) => (
              <ProductNameRow
                key={group.name}
                group={group}
                onClick={() => {
                  handle_group_click(group)
                }}
                onDelete={() => {
                  if (confirm(`Are you sure you want to delete "${group.name}" and all its colors?`)) {
                    setProducts((prev) => prev.filter((p) => p.name !== group.name))
                  }
                }}
                onRequest={onRequest}
              />
            ))}
          </Table.Tbody>

          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={3}>
                <div className="flex gap-2 flex-col mt-6">
                  <div className="flex gap-2 items-center justify-center">
                    <Button onClick={handle_create_new_product} disabled={onRequest} color="blue">
                      Create New
                    </Button>
                    <span>Search</span>
                    <TextInput
                      placeholder="crypton-x"
                      value={search_query}
                      onChange={(e) => {
                        set_search_query(e.target.value)
                      }}
                    />
                  </div>

                  <div className="flex justify-center mt-4">
                    <Pagination
                      value={page_number}
                      onChange={set_page_number}
                      total={total_pages}
                      disabled={onRequest}
                    />
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={async () => {
                        setOnRequest(true)
                        try {
                          const products_with_ids = products.map((p) => ({
                            ...p,
                            id: p.id || id(),
                          }))

                          const validated_products = zodProducts.safeParse(products_with_ids)
                          if (!validated_products.success) {
                            const error_messages = validated_products.error.errors
                              .map((err) => {
                                const path = err.path.join(' -> ')

                                return `${path}: ${err.message}`
                              })
                              .join('\n')

                            alert(`Invalid product data:\n\n${error_messages}`)
                            console.error(validated_products.error)
                            setOnRequest(false)

                            return
                          }

                          const variants_data = products_with_ids.map((p) => ({
                            product_id: p.id,
                            sizes: p.sizes,
                          }))

                          const validated_variants = z
                            .array(
                              z.object({
                                product_id: z.string(),
                                sizes: z.array(z.string()),
                              })
                            )
                            .safeParse(variants_data)
                          if (!validated_variants.success) {
                            const error_messages = validated_variants.error.errors
                              .map((err) => {
                                const path = err.path.join(' -> ')

                                return `${path}: ${err.message}`
                              })
                              .join('\n')

                            alert(`Invalid variant data:\n\n${error_messages}`)
                            console.error(validated_variants.error)
                            setOnRequest(false)

                            return
                          }

                          const res1 = await axios.post(
                            `${envClient.API_ADMIN_URL}/product/collection/product`,
                            {
                              products: validated_products.data,
                            },
                          )

                          const res2 = await axios.post(
                            `${envClient.API_ADMIN_URL}/product/collection/variant`,
                            {
                              variants: validated_variants.data,
                            },
                          )

                          if (res1.status === 200 && res2.status === 200) {
                            window.location.reload()
                          } else {
                            alert(
                              `Error saving: ${res1.data?.message || res2.data?.message || ERROR.unexpected}`,
                            )
                            console.error(res1, res2)
                          }
                        } catch (err) {
                          alert('Error saving')
                          console.error(err)
                        }
                        setOnRequest(false)
                      }}
                      type="button"
                      disabled={!products_have_changed || onRequest}
                      color="green"
                    >
                      {onRequest ? 'Wait ...' : 'Apply changes'}
                    </Button>
                  </div>
                </div>
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Table.ScrollContainer>
    </>
  )
}
