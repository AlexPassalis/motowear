'use client'

import type { typeProductPage } from '@/lib/postgres/data/type'

import type { typeShipping } from '@/utils/getPostgres'
import type { getProductPageDataCached } from '@/app/(user)/cache'

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  useReducer,
  CSSProperties,
} from 'react'
import { useCounter, useDisclosure } from '@mantine/hooks'
import {
  Accordion,
  Button,
  Card,
  Container,
  Modal,
  Text,
  Textarea,
  UnstyledButton,
} from '@mantine/core'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTE_COLLECTION, ROUTE_PRODUCT } from '@/data/routes'
import { envClient } from '@/envClient'
import { IoIosArrowDown } from 'react-icons/io'
import { Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HeaderProvider from '@/context/HeaderProvider'
import { useHeaderContext } from '@/context/useHeaderContext'
import { Carousel } from '@mantine/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { Pagination } from '@mantine/core'
import { IoIosStar } from 'react-icons/io'
import { TfiRulerAlt } from 'react-icons/tfi'
import { FaPlus, FaMinus, FaCheck } from 'react-icons/fa'
import {
  facebookPixelAddToCart,
  facebookPixelViewContent,
} from '@/lib/facebook-pixel'
import { special_products, special_collections } from '@/data/magic'
import {
  googleAnalyticsAddToCart,
  googleAnalyticsViewItem,
} from '@/lib/google-analytics'

type ProductPageClientProps = {
  product_types: string[]
  page: typeProductPage
  shipping: typeShipping
  collection: Awaited<ReturnType<typeof getProductPageDataCached>>['collection']
  reviews: Awaited<ReturnType<typeof getProductPageDataCached>>['reviews']
  brands: Awaited<ReturnType<typeof getProductPageDataCached>>['brands']
  products: Awaited<ReturnType<typeof getProductPageDataCached>>['products']
  upsells: Awaited<ReturnType<typeof getProductPageDataCached>>['upsells']
  product: string | undefined
  color: string | undefined
}

export function ProductPageClient({
  product_types,
  page,
  shipping,
  reviews,
  brands,
  collection,
  product,
  color,
  products,
  upsells,
}: ProductPageClientProps) {
  const [brandDropdown, setBrandDropdown] = useState(false)
  const [variantDropdown, setVariantDropdown] = useState(false)
  const [sizeDropdown, setSizeDropdown] = useState(false)

  return (
    <div
      onClick={() => {
        if (brandDropdown) {
          setBrandDropdown(false)
        }
        if (variantDropdown) {
          setVariantDropdown(false)
        }
        if (sizeDropdown) {
          setSizeDropdown(false)
        }
      }}
    >
      <HeaderProvider product_types={product_types} shipping={shipping}>
        <Main
          collection={collection}
          product={product}
          color={color}
          brands={brands}
          products={products}
          upsells={upsells}
          page={page}
          reviews={reviews}
          brandDropdown={brandDropdown}
          setBrandDropdown={setBrandDropdown}
          variantDropdown={variantDropdown}
          setVariantDropdown={setVariantDropdown}
          sizeDropdown={sizeDropdown}
          setSizeDropdown={setSizeDropdown}
        />
      </HeaderProvider>
    </div>
  )
}

function ProductImages({
  images,
  productType,
  className,
  style,
}: {
  images: string[]
  productType: string
  className?: string
  style?: CSSProperties
}) {
  if (images.length === 0) {
    return null
  }

  return (
    <div className={className} style={style}>
      {images.map((image, index) => (
        <Image
          key={index}
          src={`${envClient.MINIO_PRODUCT_URL}/${productType}/${image}`}
          alt={image}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto"
        />
      ))}
    </div>
  )
}

type MainProps = {
  collection: Awaited<ReturnType<typeof getProductPageDataCached>>['collection']
  reviews: Awaited<ReturnType<typeof getProductPageDataCached>>['reviews']
  brands: Awaited<ReturnType<typeof getProductPageDataCached>>['brands']
  products: Awaited<ReturnType<typeof getProductPageDataCached>>['products']
  upsells: Awaited<ReturnType<typeof getProductPageDataCached>>['upsells']
  product: string | undefined
  color: string | undefined
  page: typeProductPage
  brandDropdown: boolean
  setBrandDropdown: Dispatch<SetStateAction<boolean>>
  variantDropdown: boolean
  setVariantDropdown: Dispatch<SetStateAction<boolean>>
  sizeDropdown: boolean
  setSizeDropdown: Dispatch<SetStateAction<boolean>>
}

type ReducerState = {
  selectedBrand: string
  displayedNames: MainProps['products']
  selectedName: MainProps['products'][0]['name']
  displayedColors: MainProps['products']
  selectedColor: string | null
  displayedSizes: string[]
  selectedSize: string | null
  selectedProduct: Omit<
    MainProps['products'][0],
    'price' | 'price_before' | 'sold_out'
  > & {
    price: number
    price_before: number
    sold_out: boolean
  }
  displayedUpsellColors: MainProps['upsells'][0][]
  selectedUpsellColor: string | null
  displayedUpsellSizes: MainProps['upsells'][0][]
  selectedUpsellSize: string | null
  selectedUpsellProduct:
    | (Omit<
        MainProps['upsells'][0],
        'price' | 'price_before' | 'color' | 'sold_out'
      > & {
        price: number
        price_before: number
        sold_out: boolean
        color: string | null
        size: string | null
      })
    | null
}

type ReducerAction =
  | { type: 'CHANGE_BRAND'; payload: string }
  | { type: 'CHANGE_NAME'; payload: string }
  | { type: 'CHANGE_COLOR'; payload: string | null }
  | { type: 'CHANGE_SIZE'; payload: string | null }
  | { type: 'CHANGE_UPSELL_COLOR'; payload: string | null }
  | { type: 'CHANGE_UPSELL_SIZE'; payload: string | null }

function create_reducer(
  collection: MainProps['collection'],
  products: MainProps['products'],
) {
  return function reducer(
    state: ReducerState,
    action: ReducerAction,
  ): ReducerState {
    switch (action.type) {
      case 'CHANGE_BRAND': {
        const selected_brand = action.payload

        const displayed_names = selected_brand
          ? products.filter((prod) => prod.brand === selected_brand)
          : products

        const selected_name = displayed_names[0].name
        const displayed_colors = displayed_names.filter(
          (prod) => prod.name === selected_name && prod?.color,
        )
        const selected_color = displayed_colors[0]?.color ?? null

        let displayed_sizes =
          displayed_colors.find((prod) => prod?.color === selected_color)
            ?.sizes ?? []
        if (displayed_sizes.length === 0 && selected_color === null) {
          const product_without_color = displayed_names.find(
            (prod) => prod.name === selected_name,
          )
          displayed_sizes = product_without_color?.sizes ?? []
        }

        const found_product =
          displayed_colors.find((prod) => prod.color === selected_color) ??
          displayed_names[0]

        return {
          ...state,
          selectedBrand: selected_brand,
          displayedNames: displayed_names,
          selectedName: selected_name,
          displayedColors: displayed_colors,
          selectedColor: selected_color,
          displayedSizes: displayed_sizes,
          selectedSize: displayed_sizes[0] ?? null,
          selectedProduct: {
            ...found_product,
            price: found_product?.price ?? collection.price ?? 0,
            price_before:
              found_product?.price_before ?? collection.price_before ?? 0,
            sold_out: found_product?.sold_out ?? collection.sold_out ?? false,
          },
        }
      }
      case 'CHANGE_NAME': {
        const selected_name = action.payload

        const displayed_colors = state.displayedNames.filter(
          (prod) => prod.name === selected_name && prod?.color,
        )
        const selected_color = displayed_colors[0]?.color ?? null

        let displayed_sizes =
          displayed_colors.find((prod) => prod?.color === selected_color)
            ?.sizes ?? []
        if (displayed_sizes.length === 0 && selected_color === null) {
          const product_without_color = state.displayedNames.find(
            (prod) => prod.name === selected_name,
          )
          displayed_sizes = product_without_color?.sizes ?? []
        }

        const found_product =
          displayed_colors.find((prod) => prod.color === selected_color) ??
          state.displayedNames.find((prod) => prod.name === selected_name)!

        return {
          ...state,
          selectedName: selected_name,
          displayedColors: displayed_colors,
          selectedColor: selected_color,
          displayedSizes: displayed_sizes,
          selectedSize: displayed_sizes[0] ?? null,
          selectedProduct: {
            ...found_product,
            price: found_product?.price ?? collection.price ?? 0,
            price_before:
              found_product?.price_before ?? collection.price_before ?? 0,
            sold_out: found_product?.sold_out ?? collection.sold_out ?? false,
          },
        }
      }
      case 'CHANGE_COLOR': {
        const selected_color = action.payload

        let displayed_sizes =
          state.displayedColors.find((prod) => prod?.color === selected_color)
            ?.sizes ?? []
        if (displayed_sizes.length === 0 && selected_color === null) {
          const product_without_color = state.displayedNames.find(
            (prod) => prod.name === state.selectedName,
          )
          displayed_sizes = product_without_color?.sizes ?? []
        }

        const found_product = state.displayedColors.find(
          (prod) => prod.color === selected_color,
        )!

        return {
          ...state,
          selectedColor: selected_color,
          displayedSizes: displayed_sizes,
          selectedSize: displayed_sizes[0] ?? null,
          selectedProduct: {
            ...found_product,
            price: found_product?.price ?? collection.price ?? 0,
            price_before:
              found_product?.price_before ?? collection.price_before ?? 0,
            sold_out: found_product?.sold_out ?? collection.sold_out ?? false,
          },
        }
      }
      case 'CHANGE_SIZE': {
        const selected_size = action.payload

        const found_product =
          state.displayedColors.find(
            (prod) => prod.color === state.selectedColor,
          ) ??
          state.displayedNames.find((prod) => prod.name === state.selectedName)!

        return {
          ...state,
          selectedSize: selected_size,
          selectedProduct: {
            ...found_product,
            price: found_product?.price ?? collection.price ?? 0,
            price_before:
              found_product?.price_before ?? collection.price_before ?? 0,
            sold_out: found_product?.sold_out ?? collection.sold_out ?? false,
          },
        }
      }
      case 'CHANGE_UPSELL_COLOR': {
        const selected_upsell_color = action.payload

        const displayed_upsell_sizes =
          selected_upsell_color !== null
            ? state.displayedUpsellColors.filter(
                (upsell) => upsell.color === selected_upsell_color,
              )
            : state.displayedUpsellColors

        const selected_upsell_size =
          displayed_upsell_sizes[0]?.sizes?.[0] ?? null

        const found_upsell =
          state.displayedUpsellColors.find(
            (upsell) => upsell.color === selected_upsell_color,
          ) ?? state.displayedUpsellColors[0]

        return {
          ...state,
          selectedUpsellColor: selected_upsell_color,
          displayedUpsellSizes: displayed_upsell_sizes,
          selectedUpsellSize: selected_upsell_size,
          selectedUpsellProduct: {
            ...found_upsell,
            price: found_upsell?.price ?? 0,
            price_before: found_upsell?.price_before ?? 0,
            sold_out: found_upsell?.sold_out ?? false,
            color: selected_upsell_color,
            size: selected_upsell_size,
          },
        }
      }
      case 'CHANGE_UPSELL_SIZE': {
        const selected_upsell_size = action.payload

        const found_upsell =
          state.displayedUpsellColors.find(
            (upsell) => upsell.color === state.selectedUpsellColor,
          ) ?? state.displayedUpsellColors[0]

        return {
          ...state,
          selectedUpsellSize: selected_upsell_size,
          selectedUpsellProduct: {
            ...found_upsell,
            price: found_upsell?.price ?? 0,
            price_before: found_upsell?.price_before ?? 0,
            sold_out: found_upsell?.sold_out ?? false,
            color: state.selectedUpsellColor,
            size: selected_upsell_size,
          },
        }
      }
      default:
        return state
    }
  }
}

function Main({
  collection,
  product,
  color,
  brands,
  products,
  upsells,
  page,
  reviews: postgres_reviews,
  brandDropdown,
  setBrandDropdown,
  variantDropdown,
  setVariantDropdown,
  sizeDropdown,
  setSizeDropdown,
}: MainProps) {
  const { setCart, setIsCartOpen } = useHeaderContext()

  const collection_name = collection.name

  const displayedBrands = brands

  const [state, dispatch] = useReducer(
    create_reducer(collection, products),
    null,
    () => {
      const initial_displayed_colors = products.filter(
        (prod) => prod.name === (product ?? products[0].name) && prod?.color,
      )
      const initial_selected_color =
        color ?? initial_displayed_colors[0]?.color ?? null

      let initial_displayed_sizes =
        initial_displayed_colors.find(
          (prod) => prod?.color === initial_selected_color,
        )?.sizes ?? []
      if (
        initial_displayed_sizes.length === 0 &&
        initial_selected_color === null
      ) {
        const product_without_color = products.find(
          (prod) => prod.name === (product ?? products[0].name),
        )
        initial_displayed_sizes = product_without_color?.sizes ?? []
      }

      const initial_found_product =
        products.find(
          (prod) =>
            prod.name === (product ?? products[0].name) &&
            (initial_selected_color === null ||
              prod.color === initial_selected_color) &&
            (initial_displayed_sizes[0] === null ||
              prod.sizes?.includes(initial_displayed_sizes[0]) ||
              collection.sizes?.includes(initial_displayed_sizes[0])),
        ) ?? products[0]

      const initial_displayed_upsell_colors = upsells
      const initial_selected_upsell_color =
        initial_displayed_upsell_colors[0]?.color ?? null

      const initial_displayed_upsell_sizes =
        initial_selected_upsell_color !== null
          ? initial_displayed_upsell_colors.filter(
              (upsell) => upsell.color === initial_selected_upsell_color,
            )
          : initial_displayed_upsell_colors

      const initial_selected_upsell_size =
        initial_displayed_upsell_sizes[0]?.sizes?.[0] ?? null

      const initial_selected_upsell_product =
        upsells.length > 0
          ? {
              ...initial_displayed_upsell_colors[0],
              price: initial_displayed_upsell_colors[0]?.price ?? 0,
              price_before:
                initial_displayed_upsell_colors[0]?.price_before ?? 0,
              sold_out: initial_displayed_upsell_colors[0]?.sold_out ?? false,
              color: initial_selected_upsell_color,
              size: initial_selected_upsell_size,
            }
          : null

      return {
        selectedBrand: '',
        displayedNames: products,
        selectedName: product ?? products[0].name,
        displayedColors: initial_displayed_colors,
        selectedColor: initial_selected_color,
        displayedSizes: initial_displayed_sizes,
        selectedSize: initial_displayed_sizes[0] ?? null,
        selectedProduct: {
          ...initial_found_product,
          price: initial_found_product?.price ?? collection.price ?? 0,
          price_before:
            initial_found_product?.price_before ?? collection.price_before ?? 0,
          sold_out:
            initial_found_product?.sold_out ?? collection.sold_out ?? false,
        },
        displayedUpsellColors: initial_displayed_upsell_colors,
        selectedUpsellColor: initial_selected_upsell_color,
        displayedUpsellSizes: initial_displayed_upsell_sizes,
        selectedUpsellSize: initial_selected_upsell_size,
        selectedUpsellProduct: initial_selected_upsell_product,
      }
    },
  )

  const [count, handlers] = useCounter(0, { min: 1, max: 9 })
  const [
    sizeChartModal,
    { open: openSizeChartModal, close: closeSizeChartModal },
  ] = useDisclosure(false)

  const [upsellModal, { open: openUpsellModal, close: closeUpsellModal }] =
    useDisclosure(false)

  const [reviewsPage, setReviewsPage] = useState(1)

  const autoplay = useRef(Autoplay({ delay: 3000 }))

  const customRef = useRef<null | HTMLTextAreaElement>(null)
  const [customError, setCustomError] = useState<string | null>(null)

  const doNotFindYourMoto = products.some((prod) =>
    special_products.includes(prod.name),
  )

  const variantIsSoldOut = state.selectedProduct.sold_out

  useEffect(() => {
    facebookPixelViewContent(
      collection_name,
      state.selectedProduct.name,
      state.selectedProduct.price,
    )
    googleAnalyticsViewItem(
      collection_name,
      state.selectedProduct.name,
      state.selectedProduct.price,
    )
  }, [collection_name, state.selectedProduct.name])

  return (
    <>
      {page.size_chart && (
        <Modal
          opened={sizeChartModal}
          onClose={() => closeSizeChartModal()}
          centered
        >
          <div className="relative aspect-square">
            <Image
              src={`${envClient.MINIO_PRODUCT_URL}/${collection_name}/${page.size_chart}`}
              alt={page.size_chart}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </Modal>
      )}

      {upsells.length > 0 && (
        <Modal
          opened={upsellModal}
          onClose={() => {
            closeUpsellModal()
            setIsCartOpen(true)
          }}
          title={`${page.upsell}`}
          classNames={{
            header: '!relative !flex',
            title: '!mx-auto !text-xl',
            close: '!absolute !top-4 !right-4',
          }}
          centered
        >
          <>
            {state.selectedUpsellProduct && (
              <div className="flex flex-col">
                <div className="flex">
                  <h1 className="text-xl">
                    {state.selectedUpsellProduct.collection}
                  </h1>
                  <div className="flex gap-2 ml-auto">
                    {state.selectedUpsellProduct.price_before > 0 && (
                      <h2 className="text-xl text-[var(--mantine-border)] line-through decoration-red-500">{`${state.selectedUpsellProduct.price_before}€`}</h2>
                    )}
                    <h2 className="text-xl">{`${state.selectedUpsellProduct.price}€`}</h2>
                  </div>
                </div>
                <h1 className="text-xl">{state.selectedUpsellProduct.name}</h1>
                <div className="relative aspect-square w-3/4 mx-auto my-2">
                  <Image
                    src={`${envClient.MINIO_PRODUCT_URL}/${state.selectedUpsellProduct.collection}/${state.selectedUpsellProduct.images[0]}`}
                    alt={state.selectedUpsellProduct.images[0]}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {state.displayedUpsellColors
                  .filter((prod) => prod.color)
                  .map((prod) => prod.color)
                  .filter(
                    (item, index, self) =>
                      index === self.findIndex((other) => other === item),
                  ).length > 0 && (
                  <div className="mb-2">
                    <h1 className="mb-1 text-lg">Χρώμα</h1>
                    <div className="flex gap-2">
                      {state.displayedUpsellColors
                        .filter((prod) => prod.color)
                        .map((prod) => prod.color)
                        .filter(
                          (item, index, self) =>
                            index === self.findIndex((other) => other === item),
                        )
                        .map((color, index) => {
                          return color === state.selectedUpsellColor ? (
                            <div
                              key={index}
                              onClick={() => {
                                dispatch({
                                  type: 'CHANGE_UPSELL_COLOR',
                                  payload: color ?? null,
                                })
                              }}
                              className="w-8 h-8 rounded-full p-0.5 border-2 border-black hover:cursor-pointer"
                            >
                              <div
                                style={{ backgroundColor: color }}
                                className="w-full h-full rounded-full"
                              />
                            </div>
                          ) : (
                            <div
                              key={index}
                              onClick={() => {
                                dispatch({
                                  type: 'CHANGE_UPSELL_COLOR',
                                  payload: color ?? null,
                                })
                              }}
                              style={{ backgroundColor: color }}
                              className={`w-8 h-8 rounded-full hover:cursor-pointer ${
                                color === 'White' ? 'border border-black' : ''
                              }`}
                            />
                          )
                        })}
                    </div>
                  </div>
                )}

                {state.displayedUpsellSizes.length > 0 &&
                  state.displayedUpsellSizes[0]?.sizes &&
                  state.displayedUpsellSizes[0].sizes.length > 0 && (
                    <div className="mb-2">
                      <h1 className="mb-1 text-lg">
                        {special_collections.includes(
                          state.selectedUpsellProduct.collection,
                        )
                          ? 'Μέγεθος'
                          : 'Συσκευή'}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        {state.displayedUpsellSizes[0].sizes.map(
                          (size, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                dispatch({
                                  type: 'CHANGE_UPSELL_SIZE',
                                  payload: size,
                                })
                              }}
                              className={`min-w-9 h-[31.5px] border-2 rounded-lg ${
                                state.selectedUpsellSize === size
                                  ? 'border-black'
                                  : 'border-[var(--mantine-border)]'
                              }`}
                            >
                              <UnstyledButton
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: '0 8px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {size}
                              </UnstyledButton>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                <div className="mt-4 flex gap-2 w-full justify-center items-center">
                  <div className="flex w-24 h-[42px] rounded-lg border-2 border-[var(--mantine-border)]">
                    <div onClick={() => handlers.decrement()} className="w-1/3">
                      <UnstyledButton
                        size="compact-sm"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <FaMinus size={10} />
                      </UnstyledButton>
                    </div>
                    <div className="flex w-1/3 items-center justify-center border-x-1 border-[var(--mantine-border)]">
                      <p>{count}</p>
                    </div>
                    <div onClick={() => handlers.increment()} className="w-1/3">
                      <UnstyledButton
                        size="compact-md"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <FaPlus size={10} />
                      </UnstyledButton>
                    </div>
                  </div>
                  <Button
                    disabled={state.selectedUpsellProduct.sold_out}
                    onClick={() => {
                      closeUpsellModal()
                      setIsCartOpen(true)
                      if (!state.selectedUpsellProduct) {
                        return
                      }

                      const upsell_product = state.selectedUpsellProduct

                      setCart((prev) => {
                        const existingIndex = prev.findIndex(
                          (item) =>
                            item.collection === upsell_product.collection &&
                            item.name === upsell_product.name &&
                            item.color === upsell_product.color &&
                            item.size === upsell_product.size,
                        )
                        if (existingIndex !== -1) {
                          const updatedCart = [...prev]
                          updatedCart[existingIndex] = {
                            ...updatedCart[existingIndex],
                            quantity:
                              updatedCart[existingIndex].quantity + count,
                          }
                          return updatedCart
                        } else {
                          return [
                            ...prev,
                            {
                              image: upsell_product.images[0],
                              collection: upsell_product.collection,
                              name: upsell_product.name,
                              color: upsell_product.color,
                              size: upsell_product.size,
                              price: upsell_product.price,
                              price_before: upsell_product.price_before,
                              quantity: count,
                            },
                          ]
                        }
                      })

                      facebookPixelAddToCart(
                        upsell_product.price,
                        count,
                        upsell_product.collection,
                        upsell_product.name,
                        upsell_product.color,
                        upsell_product.size,
                      )

                      googleAnalyticsAddToCart(
                        upsell_product.price,
                        count,
                        upsell_product.collection,
                        upsell_product.name,
                        upsell_product.color,
                        upsell_product.size,
                      )
                    }}
                    color="red"
                    size="md"
                    radius="md"
                    style={{ width: '100%' }}
                  >
                    {state.selectedUpsellProduct.sold_out
                      ? 'Sold out'
                      : 'Προσθήκη στο Καλάθι'}
                  </Button>
                </div>
              </div>
            )}
          </>
        </Modal>
      )}

      <main className="flex-1">
        <div className="md:flex">
          <div className="md:w-1/2">
            <Carousel withIndicators>
              {state.selectedProduct.images.map((img) => (
                <Carousel.Slide key={img}>
                  <div className="relative aspect-[1/1.15]">
                    <Image
                      src={`${envClient.MINIO_PRODUCT_URL}/${collection_name}/${img}`}
                      alt={img}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      fetchPriority="high"
                    />
                  </div>
                </Carousel.Slide>
              ))}
            </Carousel>
            {page.product_description && (
              <h2 className="hidden md:block m-4 whitespace-pre-line proxima-nova text-lg xl:text-xl 2xl:hidden">
                {page.product_description}
              </h2>
            )}
          </div>
          <div className="m-4 mb-8 md:w-1/2 md:mt-0 md:flex md:flex-col">
            <div className="flex gap-2 text-xl xl:text-2xl">
              <Link href={`${ROUTE_COLLECTION}/${collection_name}`}>
                {collection_name}
              </Link>
              <p>/</p>
              <h1 className="text-xl xl:text-2xl">{state.selectedName}</h1>
            </div>

            <div className="flex items-center mb-4">
              {postgres_reviews.length > 0 && (
                <Link
                  href="#reviews"
                  scroll={true}
                  className="flex items-center"
                >
                  {Array.from(
                    {
                      length: Math.round(
                        postgres_reviews.reduce(
                          (sum, review) => sum + review.rating,
                          0,
                        ) / postgres_reviews.length,
                      ),
                    },
                    (_, i) => (
                      <IoIosStar
                        key={i}
                        size={18}
                        className="text-yellow-500"
                      />
                    ),
                  )}
                  <span className="ml-2 proxima-nova text-sm xl:text-base">
                    ({postgres_reviews.length} κριτικές)
                  </span>
                </Link>
              )}
              <div className="flex gap-2 ml-auto">
                {state.selectedProduct?.price_before && (
                  <h2 className="text-xl xl:text-2xl text-[var(--mantine-border)] line-through decoration-red-500">{`${state.selectedProduct.price_before}€`}</h2>
                )}
                <h2 className="text-xl xl:text-2xl">{`${state.selectedProduct.price}€`}</h2>
              </div>
            </div>

            {state.selectedProduct.description && (
              <p className="mb-4 whitespace-pre-line proxima-nova xl:text-lg">
                {state.selectedProduct.description}
              </p>
            )}

            {displayedBrands.length > 1 && (
              <div className="mb-2">
                <h1 className="text-xl xl:text-2xl">Μάρκα</h1>
                <div
                  onClick={() => setBrandDropdown((prev) => !prev)}
                  className={`flex items-center pb-0.5 border-2 border-white ${
                    brandDropdown
                      ? 'border-b-white'
                      : 'border-b-[var(--mantine-border)]'
                  } hover:border-2 hover:rounded-lg hover:border-red-500`}
                >
                  {state.selectedBrand === '' ? (
                    <UnstyledButton
                      style={{
                        height: '48px',
                        width: '100%',
                        marginLeft: '8px',
                        cursor: 'pointer',
                      }}
                      className="proxima-nova"
                      classNames={{
                        root: '!text-lg !xl:text-xl',
                      }}
                    >
                      Επίλεξε
                    </UnstyledButton>
                  ) : (
                    <div className="relative w-full max-w-96 h-12">
                      <Image
                        src={`${envClient.MINIO_PRODUCT_URL}/brands/${state.selectedBrand}`}
                        alt={state.selectedBrand}
                        fill
                      />
                    </div>
                  )}
                  <motion.span
                    className="ml-auto"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: brandDropdown ? 180 : 0 }}
                    transition={{ duration: 0.025, ease: 'easeInOut' }}
                  >
                    <IoIosArrowDown />
                  </motion.span>
                </div>
                <AnimatePresence>
                  {brandDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        duration: 0.025,
                        ease: 'easeInOut',
                      }}
                      className="flex flex-col gap-1 max-h-96 overflow-y-auto p-1 border rounded-lg mt-0.5"
                    >
                      {state.selectedBrand !== '' && (
                        <>
                          <div
                            onClick={() =>
                              dispatch({ type: 'CHANGE_BRAND', payload: '' })
                            }
                            className="p-1 border border-white rounded-lg hover:border-red-500"
                          >
                            <UnstyledButton
                              style={{
                                width: '100%',
                                height: '48px',
                              }}
                              className="proxima-nova"
                              classNames={{
                                root: '!text-lg !xl:text-xl',
                              }}
                            >
                              καμία μάρκα
                            </UnstyledButton>
                          </div>
                          {displayedBrands.length !== 1 && (
                            <hr className="w-full border-t-2 border-[var(--mantine-border)]" />
                          )}
                        </>
                      )}
                      {displayedBrands
                        .filter((brand) => brand !== state.selectedBrand)
                        .map((brand, index, array) => (
                          <Fragment key={index}>
                            <div
                              onClick={() => {
                                dispatch({
                                  type: 'CHANGE_BRAND',
                                  payload: brand,
                                })
                                window.history.pushState(
                                  {},
                                  '',
                                  `${ROUTE_PRODUCT}/${collection_name}`,
                                )
                              }}
                              className="p-1 border border-white rounded-lg hover:border-red-500"
                            >
                              <div className="relative w-full max-w-96 h-12 hover:cursor-pointer">
                                <Image
                                  src={`${envClient.MINIO_PRODUCT_URL}/brands/${brand}`}
                                  alt={brand}
                                  fill
                                />
                              </div>
                            </div>
                            {index !== array.length - 1 && (
                              <hr className="w-full border-t-2 border-[var(--mantine-border)]" />
                            )}
                          </Fragment>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {state.displayedNames.filter(
              (prod, index, self) =>
                index === self.findIndex((other) => other.name === prod.name),
            ).length > 1 && (
              <div id="prod" className="mb-2">
                <div className="flex gap-2 items-center">
                  <h1 className="text-xl xl:text-2xl">Μοντέλο</h1>
                  {doNotFindYourMoto && (
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'CHANGE_NAME',
                          payload: special_products[0],
                        })
                        window.history.pushState(
                          {},
                          '',
                          `${ROUTE_PRODUCT}/${collection_name}/${special_products[0]}`,
                        )
                      }}
                      className="ml-auto proxima-nova !text-xs lg:!text-lg text-red-500 hover:underline hover:cursor-pointer"
                    >
                      Δεν βρίσκεις την μηχανή σου; Πάτησε εδώ
                    </button>
                  )}
                </div>
                <div
                  onClick={() => setVariantDropdown((prev) => !prev)}
                  className={`mb-2 flex items-center pb-0.5 border-2 border-white ${
                    variantDropdown
                      ? 'border-b-white'
                      : 'border-b-[var(--mantine-border)]'
                  } hover:border-2 hover:rounded-lg hover:border-red-500`}
                >
                  <UnstyledButton
                    style={{
                      height: '48px',
                      width: '100%',
                      textAlign: 'left',
                      marginLeft: '8px',
                      cursor: 'pointer',
                    }}
                    className="proxima-nova"
                    classNames={{
                      root: `!text-lg !xl:text-xl ${
                        special_products.includes(state.selectedName)
                          ? '!italic'
                          : ''
                      }`,
                    }}
                  >
                    {state.selectedName}
                  </UnstyledButton>
                  <motion.span
                    className="ml-auto"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: variantDropdown ? 180 : 0 }}
                    transition={{ duration: 0.025, ease: 'easeInOut' }}
                  >
                    <IoIosArrowDown />
                  </motion.span>
                </div>
                <AnimatePresence>
                  {variantDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        duration: 0.025,
                        ease: 'easeInOut',
                      }}
                      className="flex flex-col gap-1 max-h-96 overflow-y-auto p-1 border rounded-lg mt-0.5"
                    >
                      {state.displayedNames
                        .filter(
                          (prod, index, self) =>
                            prod.name !== state.selectedName &&
                            index ===
                              self.findIndex(
                                (other) => other.name === prod.name,
                              ),
                        )
                        .map(({ name }, index, array) => (
                          <Fragment key={index}>
                            <div
                              onClick={() => {
                                dispatch({ type: 'CHANGE_NAME', payload: name })
                                window.history.pushState(
                                  {},
                                  '',
                                  `${ROUTE_PRODUCT}/${collection.name}/${name}`,
                                )
                              }}
                              className="proxima-nova flex justify-center p-1 border border-white rounded-lg hover:border-red-500"
                            >
                              <UnstyledButton
                                style={{
                                  width: '100%',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                className="proxima-nova"
                                classNames={{
                                  root: `!text-lg !xl:text-xl ${
                                    special_products.includes(name)
                                      ? '!italic'
                                      : ''
                                  }`,
                                }}
                              >
                                {name}
                              </UnstyledButton>
                            </div>
                            {index !== array.length - 1 && (
                              <hr className="w-full border-t-2 border-[var(--mantine-border)]" />
                            )}
                          </Fragment>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {special_products.includes(state.selectedName) && (
              <Textarea
                ref={customRef}
                autosize
                minRows={5}
                label="Πληκτρολογήστε το μοντέλο της μηχανής"
                placeholder={`ΠΩΣ ΛΕΙΤΟΥΡΓΕΙ;
    1. Πληκτρολογείς το μοντέλο της μηχανής σου (με χρονολογία)
    2. Ο εξιδεικευμένος γραφίστας μας φτιάχνει το σχέδιο σου σε 2-3 εργάσιμες.
    3. Σου το στέλνουμε στο email ώστε να το εγκρινεις.
    4. Το τυπώνουμε στη μπλούζα και το παραλαμβάνεις σε 1-3 εργάσιμες.`}
                mb="sm"
                error={customError}
                onChange={() => customError && setCustomError(null)}
              />
            )}

            {state.displayedColors.length > 0 && (
              <div className="mb-2">
                <h1 className="mb-1 text-xl xl:text-2xl">Χρώμα</h1>
                <div className="flex gap-2">
                  {state.displayedColors.map(({ color }, index) => {
                    return color === state.selectedColor ? (
                      <div
                        key={index}
                        onClick={() => {
                          dispatch({
                            type: 'CHANGE_COLOR',
                            payload: color ?? null,
                          })
                          window.history.pushState(
                            {},
                            '',
                            `${ROUTE_PRODUCT}/${collection_name}/${state.selectedName}?color=${color}`,
                          )
                        }}
                        className={`w-11 h-11 rounded-full p-0.5 border-2 ${
                          state.selectedColor === color
                            ? 'border-black'
                            : 'border-[var(--mantine-border)]'
                        } hover:cursor-pointer`}
                      >
                        <div
                          style={{ backgroundColor: color }}
                          className="w-full h-full rounded-full"
                        />
                      </div>
                    ) : (
                      <div
                        key={index}
                        onClick={() => {
                          dispatch({
                            type: 'CHANGE_COLOR',
                            payload: color ?? null,
                          })
                          window.history.pushState(
                            {},
                            '',
                            `${ROUTE_PRODUCT}/${collection_name}/${state.selectedName}?color=${color}`,
                          )
                        }}
                        style={{ backgroundColor: color }}
                        className={`w-11 h-11 rounded-full hover:cursor-pointer ${
                          color === 'White' ? 'border border-black' : ''
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {state.displayedSizes.length > 0 &&
              (special_collections.includes(collection.name) ? (
                <div>
                  <h1 className="mb-1 text-xl xl:text-2xl">Συσκευή</h1>
                  <div
                    onClick={() => setSizeDropdown((prev) => !prev)}
                    className={`mb-2 flex items-center pb-0.5 border-2 border-white ${
                      sizeDropdown
                        ? 'border-b-white'
                        : 'border-b-[var(--mantine-border)]'
                    } hover:border-2 hover:rounded-lg hover:border-red-500`}
                  >
                    <UnstyledButton
                      style={{
                        height: '48px',
                        width: '100%',
                        textAlign: 'left',
                        marginLeft: '8px',
                        cursor: 'pointer',
                      }}
                      className="proxima-nova"
                      classNames={{
                        root: '!text-lg !xl:text-xl',
                      }}
                    >
                      {state.selectedSize}
                    </UnstyledButton>
                    <motion.span
                      className="ml-auto"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: sizeDropdown ? 180 : 0 }}
                      transition={{ duration: 0.025, ease: 'easeInOut' }}
                    >
                      <IoIosArrowDown />
                    </motion.span>
                  </div>
                  <AnimatePresence>
                    {sizeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                          duration: 0.025,
                          ease: 'easeInOut',
                        }}
                        className="flex flex-col gap-1 max-h-96 overflow-y-auto p-1 border rounded-lg mt-0.5"
                      >
                        {state.displayedSizes
                          .filter((size) => size !== state.selectedSize)
                          .map((size, index, array) => (
                            <Fragment key={index}>
                              <div
                                onClick={() =>
                                  dispatch({
                                    type: 'CHANGE_SIZE',
                                    payload: size,
                                  })
                                }
                                className="proxima-nova flex justify-center p-1 border border-white rounded-lg hover:border-red-500"
                              >
                                <UnstyledButton
                                  style={{
                                    width: '100%',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  className="proxima-nova"
                                  classNames={{
                                    root: '!text-lg !xl:text-xl',
                                  }}
                                >
                                  {size}
                                </UnstyledButton>
                              </div>
                              {index !== array.length - 1 && (
                                <hr className="w-full border-t-2 border-[var(--mantine-border)]" />
                              )}
                            </Fragment>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="flex gap-2 items-center">
                    <h1 className="mb-1 text-xl lg:text-2xl">Μέγεθος</h1>
                    {page.size_chart && (
                      <div
                        className="ml-auto flex gap-1 hover:cursor-pointer"
                        onClick={() => openSizeChartModal()}
                      >
                        <h2 className="proxima-nova text-xs lg:text-lg text-red-500 hover:underline hover:cursor-pointer">
                          Μεγεθολόγιο
                        </h2>
                        <TfiRulerAlt />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {state.displayedSizes.map((size, index) => {
                      const sizeVariantIsSoldOut =
                        products.find(
                          (prod) =>
                            prod.name === state.selectedName &&
                            prod.color === state.selectedColor &&
                            prod.sizes &&
                            prod.sizes.includes(size),
                        )?.sold_out === true

                      return (
                        <div
                          key={index}
                          onClick={() =>
                            dispatch({ type: 'CHANGE_SIZE', payload: size })
                          }
                          className={`w-12 h-[42px] border-2 rounded-lg ${
                            state.selectedSize === size
                              ? 'border-black'
                              : 'border-[var(--mantine-border)]'
                          }`}
                        >
                          <UnstyledButton
                            size="md"
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              textDecoration: sizeVariantIsSoldOut
                                ? 'line-through'
                                : 'none',
                              textDecorationColor: sizeVariantIsSoldOut
                                ? 'red'
                                : 'inherit',
                            }}
                          >
                            {size}
                          </UnstyledButton>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

            <div className="lg:mb-8 2xl:mb-0 mt-6 flex gap-2 w-full justify-center items-center">
              <div className="flex w-24 h-[42px] rounded-lg border-2 border-[var(--mantine-border)]">
                <div onClick={() => handlers.decrement()} className="w-1/3">
                  <UnstyledButton
                    size="compact-sm"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FaMinus size={10} />
                  </UnstyledButton>
                </div>
                <div className="flex w-1/3 items-center justify-center border-x-1 border-[var(--mantine-border)]">
                  <p>{count}</p>
                </div>
                <div onClick={() => handlers.increment()} className="w-1/3">
                  <UnstyledButton
                    size="compact-md"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FaPlus size={10} />
                  </UnstyledButton>
                </div>
              </div>
              <Button
                disabled={variantIsSoldOut}
                onClick={() => {
                  if (special_products.includes(state.selectedProduct.name)) {
                    const textAreaValueLength =
                      customRef.current!.value.trim().length
                    if (textAreaValueLength < 3) {
                      setCustomError(
                        'Πρέπει να πληκτρολογήσετε τουλάχιστον 3 χαρακτήρες!',
                      )
                      return
                    }
                    if (textAreaValueLength > 50) {
                      setCustomError(
                        'Μπορείτε να πληκτρολογήσετε μέχρι 50 χαρακτήρες!',
                      )
                      return
                    }
                  }

                  if (state.selectedUpsellProduct) {
                    openUpsellModal()
                  } else {
                    setIsCartOpen(true)
                  }

                  setCart((prev) => {
                    const existingIndex = prev.findIndex(
                      (item) =>
                        item.collection === collection_name &&
                        item.name === state.selectedProduct.name &&
                        item.color === (state.selectedColor ?? '') &&
                        item.size === (state.selectedSize ?? ''),
                    )
                    if (existingIndex !== -1) {
                      const updatedCart = [...prev]
                      updatedCart[existingIndex] = {
                        ...updatedCart[existingIndex],
                        quantity: updatedCart[existingIndex].quantity + count,
                      }
                      return updatedCart
                    } else {
                      return [
                        ...prev,
                        {
                          image: state.selectedProduct.images[0],
                          collection: collection_name,
                          name: special_products.includes(
                            state.selectedProduct.name,
                          )
                            ? customRef.current!.value.trim()
                            : state.selectedProduct.name,
                          color: state.selectedColor ?? '',
                          size: state.selectedSize ?? '',
                          price: state.selectedProduct.price,
                          price_before: state.selectedProduct.price_before,
                          quantity: count,
                        },
                      ]
                    }
                  })
                  handlers.reset()

                  facebookPixelAddToCart(
                    state.selectedProduct.price,
                    count,
                    collection_name,
                    state.selectedProduct.name,
                    state.selectedColor ?? '',
                    state.selectedSize ?? '',
                  )

                  googleAnalyticsAddToCart(
                    state.selectedProduct.price,
                    count,
                    collection_name,
                    state.selectedProduct.name,
                    state.selectedColor ?? '',
                    state.selectedSize ?? '',
                  )
                }}
                color="red"
                size="md"
                radius="md"
                style={{ width: '100%' }}
              >
                {variantIsSoldOut ? 'Sold out' : 'Προσθήκη στο Καλάθι'}
              </Button>
            </div>
            {page.product_description && (
              <h2 className="hidden 2xl:block mx-4 my-8 whitespace-pre-line proxima-nova text-xl">
                {page.product_description}
              </h2>
            )}
            {page.faq.length > 0 && (
              <Container size="xl" className="hidden md:block mt-8 w-full">
                <h1 className="mb-2 text-center text-xl xl:text-2xl">FAQ</h1>
                <Accordion variant="separated">
                  {page.faq.map((faq, index) => (
                    <Fragment key={index}>
                      {index === 0 && (
                        <hr className="w-full border-b border-[var(--mantine-border)]" />
                      )}
                      <Accordion.Item
                        value={index.toString()}
                        bg="white"
                        style={{ border: 'none' }}
                      >
                        <Accordion.Control
                          classNames={{
                            control: '!text-lg !xl:text-xl',
                          }}
                        >
                          {faq.question}
                        </Accordion.Control>
                        <Accordion.Panel
                          classNames={{
                            panel: '!whitespace-pre-line !text-lg !xl:text-xl',
                          }}
                          className="proxima-nova"
                        >
                          {faq.answer}
                        </Accordion.Panel>
                      </Accordion.Item>
                      <hr className="w-full border-b border-[var(--mantine-border)]" />
                    </Fragment>
                  ))}
                </Accordion>
              </Container>
            )}
          </div>
        </div>

        {page.product_description && (
          <h2 className="md:hidden mx-4 my-8 whitespace-pre-line proxima-nova text-lg xl:text-xl">
            {page.product_description}
          </h2>
        )}

        <ProductImages
          images={page.images}
          productType={collection_name}
          className="md:hidden flex flex-col gap-4 my-8"
        />

        <ProductImages
          images={page.images}
          productType={collection_name}
          className={`hidden md:gap-4 my-8 ${
            page.images.length === 1 ? 'md:flex md:justify-center' : 'md:grid'
          }`}
          style={
            page.images.length === 1
              ? { width: '50%', margin: '2rem auto' }
              : {
                  gridTemplateColumns: `repeat(${page.images.length}, minmax(0, 1fr))`,
                }
          }
        />

        {page.faq.length > 0 && (
          <Container size="xl" className="md:hidden">
            <h1 className="mb-2 text-center text-xl xl:text-2xl">FAQ</h1>
            <Accordion variant="separated">
              {page.faq.map((faq, index) => (
                <Fragment key={index}>
                  {index === 0 && (
                    <hr className="w-full border-b border-[var(--mantine-border)]" />
                  )}
                  <Accordion.Item
                    value={index.toString()}
                    bg="white"
                    style={{ border: 'none' }}
                  >
                    <Accordion.Control
                      classNames={{
                        control: '!text-lg',
                      }}
                    >
                      {faq.question}
                    </Accordion.Control>
                    <Accordion.Panel
                      classNames={{
                        panel: '!whitespace-pre-line !text-lg !xl:text-xl',
                      }}
                      className="proxima-nova"
                    >
                      {faq.answer}
                    </Accordion.Panel>
                  </Accordion.Item>
                  <hr className="w-full border-b border-[var(--mantine-border)]" />
                </Fragment>
              ))}
            </Accordion>
          </Container>
        )}

        <div className="md:flex">
          {postgres_reviews.length > 0 && (
            <div id="reviews" className="mx-4 my-8 md:w-1/2">
              <h1 className="mb-2 text-center text-xl xl:text-2xl">
                Αξιολογήσεις
              </h1>
              {postgres_reviews
                .slice((reviewsPage - 1) * 5, reviewsPage * 5)
                .map((review, index) => (
                  <div
                    key={index}
                    className={`p-2 xl:text-lg border-[var(--mantine-border)] border-b-2 ${
                      index === 0 ? 'border-t-2' : ''
                    }`}
                  >
                    <div className="flex mb-1">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <IoIosStar
                          key={i}
                          size={18}
                          className="text-yellow-500"
                        />
                      ))}
                      <h2 className="proxima-nova ml-auto">{review.date}</h2>
                    </div>
                    <div className="mb-1 flex justify-between flex-wrap items-center">
                      <h2 className="mr-5 proxima-nova text-sm sm:text-base">
                        {review.full_name}
                      </h2>
                      <div className="flex items-center">
                        <FaCheck size={18} color="green" className="mr-1" />
                        <p className="proxima-nova text-sm sm:text-base">
                          επιβεβαιωμένη αγορά
                        </p>
                      </div>
                    </div>
                    <h2 className="whitespace-pre-line">{review.review}</h2>
                  </div>
                ))}
              <Pagination
                total={Math.ceil(postgres_reviews.length / 5)}
                onChange={(pageNumber) => setReviewsPage(pageNumber)}
                mt="xs"
                style={{ display: 'flex', justifyContent: 'center' }}
              />
            </div>
          )}

          {page.carousel.length > 0 && (
            <Card
              radius="md"
              withBorder
              padding="xl"
              className="m-4 my-8 md:w-1/2"
            >
              <Card.Section>
                <Carousel withIndicators loop plugins={[autoplay.current]}>
                  {page.carousel.map(({ image, title }, index) => (
                    <Carousel.Slide key={index}>
                      <div className="bg-white p-2">
                        <Text
                          className="mb-2 text-white text-center"
                          classNames={{
                            root: '!text-xl !xl:text-2xl',
                          }}
                        >
                          {title}
                        </Text>
                      </div>
                      <div className="relative aspect-square">
                        <Image
                          src={`${envClient.MINIO_PRODUCT_URL}/${collection_name}/${image}`}
                          alt={image}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </Carousel.Slide>
                  ))}
                </Carousel>
              </Card.Section>
            </Card>
          )}
        </div>

        {doNotFindYourMoto && (
          <Link
            href="#prod"
            scroll={true}
            onClick={() => {
              const special_variant = special_products[0]
              dispatch({ type: 'CHANGE_NAME', payload: special_variant })
              window.history.pushState(
                {},
                '',
                `${ROUTE_PRODUCT}/${collection_name}/${special_variant}`,
              )
            }}
            className="block mx-4 mb-8 text-red-500 text-center text-lg hover:underline"
          >
            ΔΕΝ ΒΡΙΣΚΕΙΣ ΤΗ ΜΗΧΑΝΗ ΣΟΥ; <br />
            Εάν δεν βρίσκεις το μοντέλο της μηχανής σου ή την μάρκα της, πάτησε
            εδώ.
          </Link>
        )}
      </main>
    </>
  )
}
