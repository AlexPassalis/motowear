import type { typeVariant } from '@/lib/postgres/data/type'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import { zodVariants } from '@/lib/postgres/data/zod'

import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button, Pagination, Table, TextInput } from '@mantine/core'
import { errorUnexpected } from '@/data/error'
import { envClient } from '@/envClient'
import axios from 'axios'
import { ProductVariantRowWrapper } from '@/app/admin/product/[product_type]/client/ProductVariantRowWrapper'
import { normalise } from '@/utils/normalise'

type ProductVariantsTableProps = {
  product_type: string
  imagesMinio: string[]
  variantsPostgres: typeVariant[]
  brandsPostgres: string[]
  variants: typeVariant[]
  setVariants: Dispatch<SetStateAction<typeVariant[]>>
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
  modalState: typeModal
  setModalState: Dispatch<SetStateAction<typeModal>>
  modalOpened: boolean
  openModal: () => void
  closeModal: () => void
}

export function ProductVariantsTable({
  product_type,
  imagesMinio,
  variantsPostgres,
  brandsPostgres,
  variants,
  setVariants,
  onRequest,
  setOnRequest,
  setModalState,
  openModal,
}: ProductVariantsTableProps) {
  const massCreateRef = useRef<null | HTMLInputElement>(null)

  const searchValue = useRef<null | HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const paginationPageSize = 25
  const [pageNumber, setPageNumber] = useState(1)

  const filteredVariants = useMemo(() => {
    let selectedVariants = variants

    if (searchQuery) {
      const matchingVariants = variants.filter((variant) =>
        normalise(variant.name).includes(normalise(searchQuery)),
      )
      if (matchingVariants.length < 1) {
        alert('No variants with that name exist.')
        selectedVariants = []
      } else {
        selectedVariants = matchingVariants
      }
    }

    return selectedVariants
  }, [variants, searchQuery])

  const visibleVariants = useMemo(() => {
    return filteredVariants.slice(
      (pageNumber - 1) * paginationPageSize,
      pageNumber * paginationPageSize,
    )
  }, [filteredVariants, pageNumber])
  const totalPages = Math.max(
    1,
    Math.ceil(filteredVariants.length / paginationPageSize),
  )
  useEffect(() => {
    setPageNumber((prevPageNumber) =>
      Math.min(Math.max(1, prevPageNumber), totalPages),
    )
  }, [totalPages])

  const setVariantsCb = useCallback(setVariants, [setVariants])
  const setModalStateCb = useCallback(setModalState, [setModalState])
  const openModalCb = useCallback(openModal, [openModal])
  const setOnRequestCb = useCallback(setOnRequest, [setOnRequest])

  const commonRowProps = useMemo(
    () => ({
      product_type,
      imagesMinio,
      brandsPostgres,
      onRequest,
      setVariants: setVariantsCb,
      setModalState: setModalStateCb,
      openModal: openModalCb,
      setOnRequest: setOnRequestCb,
    }),
    [
      product_type,
      imagesMinio,
      brandsPostgres,
      onRequest,
      setVariantsCb,
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
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          if (!destination || destination.index === source.index) return
          const src = source.index
          const dst = destination.index
          setVariants((prev) => {
            const next = [...prev]
            const [moved] = next.splice(src, 1)
            next.splice(dst, 0, moved)
            return next
          })
        }}
      >
        <Table key={product_type} miw={700}>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: 'none' }}>
              <Table.Th
                colSpan={12}
                style={{ textAlign: 'center' }}
                className="text-2xl font-bold"
              >
                {product_type}
              </Table.Th>
            </Table.Tr>

            <Table.Tr>
              <Table.Th />
              <Table.Th style={{ textAlign: 'center' }}>Id</Table.Th>
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
                    setModalState({ type: 'ALL_IMAGES', index: 0 })
                    openModal()
                  }}
                  className="hover:cursor-pointer hover:text-green-500"
                >
                  Images
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
                    setModalState({ type: 'ALL_BRAND', index: 0 })
                    openModal()
                  }}
                  className="hover:cursor-pointer hover:text-green-500"
                >
                  Brand
                </button>
              </Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setModalState({ type: 'ALL_COLOR', index: 0 })
                    openModal()
                  }}
                  className="hover:cursor-pointer hover:text-green-500"
                >
                  Color
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
                  Size
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
                  className="hover:cursor-pointer hover:text-green-500"
                >
                  Price_Before
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
              <Table.Th />
            </Table.Tr>
          </Table.Thead>

          <Droppable droppableId="dnd-list" direction="vertical">
            {(provided) => (
              <Table.Tbody {...provided.droppableProps} ref={provided.innerRef}>
                {visibleVariants.map((_, pageIdx) => {
                  const variant = visibleVariants[pageIdx]
                  const globalIndex = variants.indexOf(variant)
                  const rowKey = variant.id || String(globalIndex)

                  return (
                    <ProductVariantRowWrapper
                      key={rowKey}
                      rowKey={rowKey}
                      index={globalIndex}
                      variant={variant}
                      common={commonRowProps}
                    />
                  )
                })}
                {provided.placeholder}
              </Table.Tbody>
            )}
          </Droppable>

          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={12}>
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
                <Table.Td colSpan={12}>
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      onClick={() => {
                        const blank: typeVariant =
                          variants.length > 0
                            ? { ...variants.at(-1)!, id: '' }
                            : {
                                product_type,
                                id: '',
                                name: '',
                                description: '',
                                images: [],
                                price: 0,
                                brand: '',
                                color: '',
                                size: '',
                                price_before: 0,
                                upsell: null,
                              }

                        const next = [...variants, blank]
                        setVariants(next)
                        setPageNumber(
                          Math.ceil(next.length / paginationPageSize),
                        )
                      }}
                      type="button"
                      disabled={onRequest}
                      color="green"
                    >
                      {onRequest ? 'Wait ...' : 'Create'}
                    </Button>
                    <TextInput ref={massCreateRef} />
                    <Button
                      onClick={() => {
                        const value = massCreateRef.current?.value.trim()
                        if (!value || variants.length === 0) return

                        const templateName = variants.at(-1)!.name
                        const clones = variants
                          .filter((v) => v.name === templateName)
                          .map((v) => ({ ...v, id: '', name: value }))

                        const next = [...variants, ...clones]
                        setVariants(next)
                        setPageNumber(
                          Math.ceil(next.length / paginationPageSize),
                        )
                        if (massCreateRef.current)
                          massCreateRef.current.value = ''
                      }}
                      type="button"
                      disabled={variants.length < 1 || onRequest}
                      color="green"
                    >
                      {onRequest ? 'Wait ...' : 'Mass Create'}
                    </Button>
                  </div>
                </Table.Td>
              </Table.Tr>
            )}

            <Table.Tr style={{ borderBottom: 'none' }}>
              <Table.Td colSpan={12}>
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
                      const { data: validatedVariants } =
                        zodVariants.safeParse(variants)

                      if (!validatedVariants) {
                        alert('Invalid variants format')
                        return
                      }

                      setOnRequest(true)
                      try {
                        const res = await axios.post(
                          `${envClient.API_ADMIN_URL}/product/product_type/variant`,
                          {
                            variants: validatedVariants,
                          },
                        )
                        if (res.status === 200) {
                          window.location.reload()
                        } else {
                          alert(
                            `Error creating New Versions: ${
                              res.data?.message || errorUnexpected
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
                      JSON.stringify(variants) ===
                        JSON.stringify(
                          variantsPostgres.filter(
                            (variant) => variant.product_type === product_type,
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
      </DragDropContext>
    </Table.ScrollContainer>
  )
}
