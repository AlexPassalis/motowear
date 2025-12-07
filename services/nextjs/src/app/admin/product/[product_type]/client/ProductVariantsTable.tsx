import type { Product, Collection } from '@/lib/postgres/data/type'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'
import type { ProductWithCollectionName } from '@/app/admin/product/[product_type]/client/index'

import { zodVariants } from '@/lib/postgres/data/zod'

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
  MultiSelect,
  NumberInput,
  Pagination,
  Select,
  Table,
  TextInput,
} from '@mantine/core'
import { envClient } from '@/envClient'
import axios from 'axios'
import { ProductVariantRow } from '@/app/admin/product/[product_type]/client/ProductVariantRow'
import { normalise } from '@/utils/normalise'
import { ERROR } from '@/data/magic'

type ProductVariantsTableProps = {
  collection: Collection
  setCollection: Dispatch<SetStateAction<Collection>>
  images_minio: string[]
  products_all: ProductWithCollectionName[]
  brands_postgres: string[]
  products: ProductWithCollectionName[]
  setProducts: Dispatch<SetStateAction<ProductWithCollectionName[]>>
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
  modalState: typeModal
  setModalState: Dispatch<SetStateAction<typeModal>>
  modalOpened: boolean
  openModal: () => void
  closeModal: () => void
}

export function ProductVariantsTable({
  collection,
  setCollection,
  images_minio,
  products_all,
  brands_postgres,
  products,
  setProducts,
  onRequest,
  setOnRequest,
  setModalState,
  openModal,
}: ProductVariantsTableProps) {
  const massCreateNameRef = useRef<null | HTMLInputElement>(null)
  const [massCreateImages, setMassCreateImages] = useState<string[]>([])
  const massCreateBrandRef = useRef<null | HTMLInputElement>(null)

  const searchValue = useRef<null | HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const paginationPageSize = 25
  const [pageNumber, setPageNumber] = useState(1)

  const upsells_select_data = useMemo(() => {
    const unique_products = products_all
      .filter((product) => !product.sold_out)
      .map((product) => ({
        label: `${product.collection_name} - ${product.name}`,
        value: product.name,
      }))
      .filter(
        (item, index, self) =>
          index === self.findIndex((other) => other.value === item.value),
      )

    return unique_products
  }, [products_all])

  const filtered_products = useMemo(() => {
    let selected_products = products

    if (searchQuery) {
      const matching_products = products.filter((product) =>
        normalise(product.name).includes(normalise(searchQuery)),
      )
      if (matching_products.length < 1) {
        alert('No products with that name exist.')
        selected_products = []
      } else {
        selected_products = matching_products
      }
    }

    return selected_products
  }, [products, searchQuery])

  const visible_products = useMemo(() => {
    return filtered_products.slice(
      (pageNumber - 1) * paginationPageSize,
      pageNumber * paginationPageSize,
    )
  }, [filtered_products, pageNumber])

  const totalPages = Math.max(
    1,
    Math.ceil(filtered_products.length / paginationPageSize),
  )

  useEffect(() => {
    setPageNumber((prevPageNumber) =>
      Math.min(Math.max(1, prevPageNumber), totalPages),
    )
  }, [totalPages])

  const setProductsCb = useCallback(setProducts, [setProducts])
  const setModalStateCb = useCallback(setModalState, [setModalState])
  const openModalCb = useCallback(openModal, [openModal])
  const setOnRequestCb = useCallback(setOnRequest, [setOnRequest])

  const commonRowProps = useMemo(
    () => ({
      collection,
      images_minio: images_minio,
      brands_postgres: brands_postgres,
      onRequest,
      setProducts: setProductsCb,
      setModalState: setModalStateCb,
      openModal: openModalCb,
      setOnRequest: setOnRequestCb,
    }),
    [
      collection,
      images_minio,
      brands_postgres,
      onRequest,
      setProductsCb,
      setModalStateCb,
      openModalCb,
      setOnRequestCb,
    ],
  )

  function handleSearch() {
    if (searchValue.current) {
      setSearchQuery(searchValue.current.value.trim())
      setPageNumber(1)
    }
  }

  return (
    <Table.ScrollContainer
      minWidth={420}
      style={{ minHeight: '200px' }}
      className="border border-neutral-300 rounded-lg bg-white m-4"
    >
      <Table key={collection.name} miw={700}>
        <Table.Thead>
          <Table.Tr style={{ borderBottom: 'none' }}>
            <Table.Th
              colSpan={8}
              style={{ textAlign: 'center' }}
              className="text-2xl font-bold"
            >
              {collection.name}
            </Table.Th>
          </Table.Tr>

          <Table.Tr>
            <Table.Th style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setModalState({ type: 'ALL_NAME', index: 0 })
                  openModal()
                }}
                className="hover:cursor-pointer hover:text-green-500"
              >
                Name
              </button>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setModalState({ type: 'ALL_DESCRIPTION', index: 0 })
                  openModal()
                }}
                className="hover:cursor-pointer hover:text-green-500"
              >
                Description
              </button>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setModalState({ type: 'ALL_PRICE', index: 0 })
                  openModal()
                }}
                className="hover:cursor-pointer hover:text-green-500"
              >
                Price
              </button>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setModalState({
                    type: 'ALL_PRICE_BEFORE',
                    index: 0,
                  })
                  openModal()
                }}
                className="whitespace-nowrap hover:cursor-pointer hover:text-green-500"
              >
                Price Before
              </button>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setModalState({ type: 'ALL_SIZE', index: 0 })
                  openModal()
                }}
                className="hover:cursor-pointer hover:text-green-500"
              >
                Sizes
              </button>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setModalState({
                    type: 'ALL_UPSELL',
                    index: 0,
                  })
                  openModal()
                }}
                className="hover:cursor-pointer hover:text-green-500"
              >
                Upsell
              </button>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  const first_product_sold_out = products[0].sold_out
                  setProducts((products) => {
                    const new_products = products.map((product) => ({
                      ...product,
                      sold_out: !first_product_sold_out,
                    }))

                    return new_products
                  })
                }}
                className={`whitespace-nowrap hover:cursor-pointer ${
                  products.every((v) => v.sold_out)
                    ? 'text-red-500 hover:text-green-500'
                    : products.every((v) => !v.sold_out)
                    ? 'text-green-500 hover:text-red-500'
                    : 'text-black hover:text-red-500'
                }`}
              >
                Sold Out
              </button>
            </Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          <Table.Tr>
            <Table.Td style={{ textAlign: 'center' }}>Default</Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
              <Button
                onClick={() => {
                  setModalState({ type: 'COLLECTION_DESCRIPTION', index: 0 })
                  openModal()
                }}
                color="blue"
                disabled={onRequest}
              >
                {collection.description &&
                  collection.description.length > 0 &&
                  '...'}
              </Button>
            </Table.Td>
            <Table.Td>
              <NumberInput
                value={collection.price || 0}
                onChange={(e) => {
                  setCollection((prev) => ({
                    ...prev,
                    price: Number(e),
                  }))
                }}
                min={0}
                max={9999.99}
                suffix="€"
                disabled={onRequest}
              />
            </Table.Td>
            <Table.Td>
              <NumberInput
                value={collection.price_before || 0}
                onChange={(e) => {
                  setCollection((prev) => ({
                    ...prev,
                    price_before: Number(e),
                  }))
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
                  setModalState({ type: 'COLLECTION_SIZES', index: 0 })
                  openModal()
                }}
                color="blue"
                disabled={onRequest}
              >
                {collection.sizes && collection.sizes.length > 0
                  ? `${collection.sizes.length} sizes`
                  : 'Sizes'}
              </Button>
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
              <Select
                data={upsells_select_data}
                value={collection.upsell}
                onChange={(value) => {
                  setCollection((prev) => ({
                    ...prev,
                    upsell: value,
                  }))
                }}
                checkIconPosition="right"
                maxDropdownHeight={200}
                searchable
                nothingFoundMessage="Nothing found..."
                clearable
                disabled={onRequest}
              />
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
              {collection.sold_out ? 'Yes' : 'No'}
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}></Table.Td>
          </Table.Tr>
          {visible_products.map((product) => {
            const rowKey = product.id || product.name

            return (
              <Table.Tr key={rowKey}>
                <ProductVariantRow
                  product={product}
                  collection={collection.name}
                  images_minio={images_minio}
                  brands_postgres={brands_postgres}
                  setProducts={setProductsCb}
                  setModalState={setModalStateCb}
                  openModal={openModalCb}
                  onRequest={onRequest}
                  setOnRequest={setOnRequestCb}
                />
              </Table.Tr>
            )
          })}
        </Table.Tbody>

        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={8}>
              <div className="flex justify-center items-center gap-2">
                <Pagination
                  total={totalPages}
                  value={pageNumber}
                  onChange={(pageNumber) => setPageNumber(pageNumber)}
                />
              </div>
            </Table.Td>
          </Table.Tr>

          {pageNumber === totalPages && !searchQuery && (
            <Table.Tr>
              <Table.Td colSpan={8}>
                <div className="flex justify-center items-center gap-2">
                  <Button
                    onClick={() => {
                      const blank: Product =
                        products.length > 0
                          ? { ...products.at(-1)!, id: '' }
                          : {
                              collection_id: collection.id,
                              id: '',
                              name: '',
                              description: null,
                              images: [],
                              price: null,
                              brand: null,
                              color: null,
                              price_before: null,
                              upsell_collection: null,
                              upsell_product: null,
                              sold_out: null,
                            }

                      const next = [...products, blank]
                      setProducts(next)
                      setPageNumber(Math.ceil(next.length / paginationPageSize))
                    }}
                    type="button"
                    disabled={onRequest}
                    color="green"
                  >
                    {onRequest ? 'Wait ...' : 'Create'}
                  </Button>
                  <TextInput
                    ref={massCreateNameRef}
                    placeholder="Name"
                    style={{ minWidth: '150px' }}
                  />
                  <MultiSelect
                    value={massCreateImages}
                    onChange={setMassCreateImages}
                    placeholder={massCreateImages.length > 0 ? '' : 'Images'}
                    style={{ minWidth: '150px' }}
                    data={images_minio}
                    styles={{
                      pillsList: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      },
                    }}
                    searchable
                  />
                  <Select
                    ref={massCreateBrandRef}
                    placeholder="Brand"
                    style={{ minWidth: '150px' }}
                    data={brands_postgres}
                    searchable
                  />
                  <Button
                    onClick={() => {
                      const name = massCreateNameRef.current?.value.trim()
                      const images = massCreateImages
                      const brand = massCreateBrandRef.current?.value.trim()
                      if (products.length === 0 || !name) {
                        return
                      }

                      const templateName = products.at(-1)!.name
                      const clones = products
                        .filter((v) => v.name === templateName)
                        .map((v) => ({
                          ...v,
                          id: '',
                          name: name,
                          ...(images &&
                            images.length > 0 && { images: images }),
                          ...(brand && { brand: brand }),
                        }))

                      const next = [...products, ...clones]
                      setProducts(next)
                      setPageNumber(Math.ceil(next.length / paginationPageSize))
                      if (massCreateNameRef.current) {
                        massCreateNameRef.current.value = ''
                      }
                      setMassCreateImages([])
                      if (massCreateBrandRef.current) {
                        massCreateBrandRef.current.value = ''
                      }
                    }}
                    type="button"
                    disabled={products.length < 1 || onRequest}
                    color="green"
                  >
                    {onRequest ? 'Wait ...' : 'Mass Create'}
                  </Button>
                </div>
              </Table.Td>
            </Table.Tr>
          )}

          <Table.Tr style={{ borderBottom: 'none' }}>
            <Table.Td colSpan={8}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <TextInput
                  ref={searchValue}
                  placeholder="1295 or Χατζηκαντής"
                  mr="md"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
                <Button
                  onClick={() => handleSearch()}
                  type="button"
                  disabled={onRequest}
                  color="blue"
                >
                  {onRequest ? 'Wait ...' : 'Search'}
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={async () => {
                    const { data: validatedProducts } =
                      zodVariants.safeParse(products)

                    if (!validatedProducts) {
                      alert('Invalid products format')
                      return
                    }

                    setOnRequest(true)
                    try {
                      const res = await axios.post(
                        `${envClient.API_ADMIN_URL}/product/collection/product`,
                        {
                          products: validatedProducts,
                        },
                      )
                      if (res.status === 200) {
                        window.location.reload()
                      } else {
                        alert(
                          `Error creating New Versions: ${
                            res.data?.message || ERROR.unexpected
                          }`,
                        )
                        console.error(res)
                      }
                    } catch (err) {
                      alert('Error creating New Versions')
                      console.error(err)
                    }
                    setOnRequest(false)
                  }}
                  type="button"
                  disabled={
                    JSON.stringify(products) ===
                      JSON.stringify(
                        products_all.filter(
                          (product) => product.collection_id === collection.id,
                        ),
                      ) || onRequest
                  }
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
  )
}
