'use client'

import { CSSProperties } from 'react'

import type {
  typeProductPage,
  typeReview,
  typeVariant,
} from '@/lib/postgres/data/type'

import type { typeShipping } from '@/utils/getPostgres'

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
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
import { specialVariant, specialProductType } from '@/data/magic'
import {
  googleAnalyticsAddToCart,
  googleAnalyticsViewItem,
} from '@/lib/google-analytics'

type ProductPageClientProps = {
  product_types: string[]
  upsellVariants: typeVariant[]
  page: typeProductPage
  postgres_reviews: typeReview[]
  shipping: typeShipping
  paramsProduct_type: string
  paramsVariant: undefined | typeVariant
  postgresVariants: typeVariant[]
}

export function ProductPageClient({
  product_types,
  upsellVariants,
  page,
  postgres_reviews,
  shipping,
  paramsProduct_type,
  paramsVariant,
  postgresVariants,
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
          paramsProduct_type={paramsProduct_type}
          paramsVariant={paramsVariant}
          upsellVariants={upsellVariants}
          postgresVariants={postgresVariants}
          page={page}
          postgres_reviews={postgres_reviews}
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
  paramsProduct_type: string
  paramsVariant: undefined | typeVariant
  upsellVariants: typeVariant[]
  postgresVariants: typeVariant[]
  page: typeProductPage
  postgres_reviews: typeReview[]
  brandDropdown: boolean
  setBrandDropdown: Dispatch<SetStateAction<boolean>>
  variantDropdown: boolean
  setVariantDropdown: Dispatch<SetStateAction<boolean>>
  sizeDropdown: boolean
  setSizeDropdown: Dispatch<SetStateAction<boolean>>
}

function Main({
  paramsProduct_type,
  paramsVariant,
  upsellVariants,
  postgresVariants,
  page,
  postgres_reviews,
  brandDropdown,
  setBrandDropdown,
  variantDropdown,
  setVariantDropdown,
  sizeDropdown,
  setSizeDropdown,
}: MainProps) {
  const { setCart, setIsCartOpen } = useHeaderContext()

  const fallbackVariant = postgresVariants[0]
  const initialState = {
    displayedBrands: postgresVariants
      .map((product) => product.brand)
      .filter(Boolean)
      .filter(
        (item, index, self) =>
          index === self.findIndex((other) => other === item),
      ),
    selectedBrand: '',
    displayedVariants: postgresVariants
      .map((product) => product.name)
      .filter(
        (item, index, self) =>
          index === self.findIndex((other) => other === item),
      ),
    selectedVariant: paramsVariant ? paramsVariant.name : fallbackVariant.name,
    displayedColors: paramsVariant
      ? postgresVariants
          .filter((variant) => variant.name === paramsVariant.name)
          .map((product) => product.color)
          .filter(Boolean)
          .filter(
            (item, index, self) =>
              index === self.findIndex((other) => other === item),
          )
      : postgresVariants
          .filter((variant) => variant.name === fallbackVariant.name)
          .map((product) => product.color)
          .filter(Boolean)
          .filter(
            (item, index, self) =>
              index === self.findIndex((other) => other === item),
          ),
    selectedColor: paramsVariant ? paramsVariant.color : fallbackVariant.color,
    displayedSizes: paramsVariant
      ? postgresVariants
          .filter((variant) => variant.name === paramsVariant.name)
          .filter((variant) => variant.color === paramsVariant.color)
          .map((product) => product.size)
          .filter(Boolean)
          .filter(
            (item, index, self) =>
              index === self.findIndex((other) => other === item),
          )
      : postgresVariants
          .filter((variant) => variant.name === fallbackVariant.name)
          .filter((variant) => variant.color === fallbackVariant.color)
          .map((product) => product.size)
          .filter(Boolean)
          .filter(
            (item, index, self) =>
              index === self.findIndex((other) => other === item),
          ),
    selectedSize: paramsVariant ? paramsVariant.size : fallbackVariant.size,
    images: paramsVariant ? paramsVariant.images : fallbackVariant.images,
    description: paramsVariant
      ? paramsVariant.description
      : fallbackVariant.description,
    price: paramsVariant ? paramsVariant.price : fallbackVariant.price,
    price_before: paramsVariant
      ? paramsVariant.price_before
      : fallbackVariant.price_before,
  }

  type State = typeof initialState
  type Action =
    | { type: 'brand'; payload: { selectedBrand: string } }
    | { type: 'variant'; payload: { selectedVariant: string } }
    | { type: 'color'; payload: { selectedColor: string } }
    | { type: 'size'; payload: { selectedSize: string } }
  function reducer(state: State, action: Action) {
    switch (action.type) {
      case 'brand': {
        const selectedBrand = action.payload.selectedBrand
        if (selectedBrand) {
          const displayedVariants = postgresVariants
            .filter(
              (product) =>
                product.brand === selectedBrand ||
                specialVariant.includes(product.name),
            )
            .map((product) => product.name)
            .filter(
              (item, index, self) =>
                index === self.findIndex((other) => other === item),
            )

          const displayedColors = postgresVariants
            .filter((product) => product.name === displayedVariants[0])
            .map((product) => product.color)
            .filter(Boolean)
            .filter(
              (item, index, self) =>
                index === self.findIndex((other) => other === item),
            )

          const foundVariant = postgresVariants.find(
            (product) => product.brand === selectedBrand,
          )!
          const displayedSizes = postgresVariants
            .filter((product) => product.name === displayedVariants[0])
            .filter((product) => product.color === displayedColors[0])
            .map((product) => product.size)
            .filter(Boolean)
            .filter(
              (item, index, self) =>
                index === self.findIndex((other) => other === item),
            )

          return {
            ...state,
            selectedBrand: selectedBrand,
            displayedVariants: displayedVariants,
            selectedVariant: displayedVariants[0],
            displayedColors: displayedColors,
            selectedColor: displayedColors[0],
            images: foundVariant.images,
            description: foundVariant.description,
            price: foundVariant.price,
            price_before: foundVariant.price_before,
            displayedSizes: displayedSizes,
            selectedSize: displayedSizes[0],
          }
        } else {
          return {
            ...state,
            selectedBrand: selectedBrand,
            displayedVariants: initialState.displayedVariants,
          }
        }
      }
      case 'variant': {
        const selectedVariant = action.payload.selectedVariant
        const displayedColors = postgresVariants
          .filter((product) => product.name === selectedVariant)
          .map((product) => product.color)
          .filter(Boolean)
          .filter(
            (item, index, self) =>
              index === self.findIndex((other) => other === item),
          )

        const foundVariant = postgresVariants.find(
          (product) => product.name === selectedVariant,
        )!
        const displayedSizes = postgresVariants
          .filter((product) => product.name === selectedVariant)
          .filter((product) => product.color === displayedColors[0])
          .map((product) => product.size)
          .filter(Boolean)
          .filter(
            (item, index, self) =>
              index === self.findIndex((other) => other === item),
          )

        return {
          ...state,
          selectedVariant: selectedVariant,
          displayedColors: displayedColors,
          selectedColor: displayedColors[0],
          images: foundVariant.images,
          description: foundVariant.description,
          price: foundVariant.price,
          price_before: foundVariant.price_before,
          displayedSizes: displayedSizes,
          selectedSize: displayedSizes[0],
        }
      }
      case 'color': {
        const selectedColor = action.payload.selectedColor
        const foundVariant = postgresVariants.find(
          (product) =>
            product.name === state.selectedVariant &&
            product.color === selectedColor,
        )!
        const displayedSizes = postgresVariants
          .filter(
            (product) =>
              product.name === state.selectedVariant &&
              product.color === selectedColor,
          )
          .map((product) => product.size)
          .filter(Boolean)
          .filter(
            (item, index, self) =>
              index === self.findIndex((other) => other === item),
          )

        return {
          ...state,
          selectedColor: selectedColor,
          images: foundVariant.images,
          description: foundVariant.description,
          price: foundVariant.price,
          price_before: foundVariant.price_before,
          displayedSizes: displayedSizes,
          selectedSize: displayedSizes[0],
        }
      }
      case 'size': {
        const selectedSize = action.payload.selectedSize
        return {
          ...state,
          selectedSize: selectedSize,
        }
      }
      default:
        return state
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState)

  const [count, handlers] = useCounter(0, { min: 1, max: 9 })
  const [
    sizeChartModal,
    { open: openSizeChartModal, close: closeSizeChartModal },
  ] = useDisclosure(false)

  const upsellProductVariant = postgresVariants.find(
    (variant) =>
      variant.product_type === paramsProduct_type &&
      variant.name === state.selectedVariant &&
      variant.color === state.selectedColor &&
      variant.size === state.selectedSize,
  )?.upsell
  const upsellDisplayedVariants = upsellProductVariant
    ? upsellVariants
        .filter(
          (variant) =>
            variant.product_type === upsellProductVariant.product_type &&
            variant.name === upsellProductVariant.name,
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : null
  const [upsellSelectedVariant, setUpsellSelectedVariant] = useState(
    upsellProductVariant
      ? upsellVariants
          .filter(
            (variant) =>
              variant.product_type === upsellProductVariant.product_type &&
              variant.name === upsellProductVariant.name,
          )
          .sort((a, b) => a.name.localeCompare(b.name))[0]
      : null,
  )
  const [upsellModal, { open: openUpsellModal, close: closeUpsellModal }] =
    useDisclosure(false)

  const [reviews, setReviews] = useState(postgres_reviews.slice(0, 5))

  const autoplay = useRef(Autoplay({ delay: 3000 }))

  const customRef = useRef<null | HTMLTextAreaElement>(null)
  const [customError, setCustomError] = useState<string | null>(null)

  const doNotFindYourMoto = postgresVariants.some((variant) =>
    specialVariant.includes(variant.name),
  )

  const variantIsSoldOut =
    postgresVariants.find(
      (variant) =>
        variant.product_type === paramsProduct_type &&
        variant.name === state.selectedVariant &&
        variant.color === state.selectedColor &&
        variant.size === state.selectedSize,
    )?.sold_out === true

  useEffect(() => {
    facebookPixelViewContent(
      paramsProduct_type,
      state.selectedVariant,
      state.price,
    )
    googleAnalyticsViewItem(
      paramsProduct_type,
      state.selectedVariant,
      state.price,
    )
  }, [paramsProduct_type, state.selectedVariant])

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
              src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${page.size_chart}`}
              alt={page.size_chart}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </Modal>
      )}

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
          {upsellProductVariant &&
            upsellDisplayedVariants &&
            upsellSelectedVariant && (
              <div className="flex flex-col">
                <div className="flex">
                  <h1 className="text-xl">
                    {upsellProductVariant.product_type}
                  </h1>
                  <div className="flex gap-2 ml-auto">
                    {upsellSelectedVariant.price_before > 0 && (
                      <h2 className="text-xl text-[var(--mantine-border)] line-through decoration-red-500">{`${upsellSelectedVariant.price_before}€`}</h2>
                    )}
                    <h2 className="text-xl">{`${upsellSelectedVariant.price}€`}</h2>
                  </div>
                </div>
                <h1 className="text-xl">{upsellProductVariant.name}</h1>
                <div className="relative aspect-square w-3/4 mx-auto my-2">
                  <Image
                    src={`${envClient.MINIO_PRODUCT_URL}/${upsellSelectedVariant.product_type}/${upsellSelectedVariant.images[0]}`}
                    alt={upsellSelectedVariant.images[0]}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {upsellDisplayedVariants
                  .map((variant) => variant.color)
                  .filter(
                    (item, index, self) =>
                      index === self.findIndex((other) => other === item),
                  ).length > 0 && (
                  <div className="mb-2">
                    <h1 className="mb-1 text-lg">Χρώμα</h1>
                    <div className="flex gap-2">
                      {upsellDisplayedVariants
                        .map((variant) => variant.color)
                        .filter(
                          (item, index, self) =>
                            index === self.findIndex((other) => other === item),
                        )
                        .map((color, index) => {
                          return color === upsellSelectedVariant.color ? (
                            <div
                              key={index}
                              onClick={() => {
                                const displayedVariants = upsellVariants
                                  .filter(
                                    (variant) =>
                                      variant.product_type ===
                                        upsellProductVariant.product_type &&
                                      variant.name ===
                                        upsellProductVariant.name,
                                  )
                                  .filter((variant) => variant.color === color)
                                  .filter(
                                    (item, index, self) =>
                                      index ===
                                      self.findIndex((other) => other === item),
                                  )
                                setUpsellSelectedVariant(displayedVariants[0])
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
                                const displayedVariants = upsellVariants
                                  .filter(
                                    (variant) =>
                                      variant.product_type ===
                                        upsellProductVariant.product_type &&
                                      variant.name ===
                                        upsellProductVariant.name,
                                  )
                                  .filter((variant) => variant.color === color)
                                  .filter(
                                    (item, index, self) =>
                                      index ===
                                      self.findIndex((other) => other === item),
                                  )
                                setUpsellSelectedVariant(displayedVariants[0])
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

                {upsellDisplayedVariants
                  .filter(
                    (variant) => variant.color === upsellSelectedVariant.color,
                  )
                  .map((variant) => variant.size).length > 0 && (
                  <div className="mb-2">
                    <h1 className="mb-1 text-lg">
                      {upsellSelectedVariant.product_type === specialProductType
                        ? 'Συσκευή'
                        : 'Μέγεθος'}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      {upsellDisplayedVariants
                        .filter(
                          (variant) =>
                            variant.color === upsellSelectedVariant.color,
                        )
                        .map((variant) => variant.size)
                        .map((size, index) => (
                          <div
                            key={index}
                            onClick={() =>
                              setUpsellSelectedVariant(
                                upsellDisplayedVariants.find(
                                  (variant) =>
                                    variant.color ===
                                      upsellSelectedVariant.color &&
                                    variant.size &&
                                    variant.size === size,
                                )!,
                              )
                            }
                            className={`min-w-9 h-[31.5px] border-2 rounded-lg ${
                              upsellSelectedVariant.size === size
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
                        ))}
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
                    onClick={() => {
                      closeUpsellModal()
                      setIsCartOpen(true)
                      setCart((prev) => {
                        const existingIndex = prev.findIndex(
                          (item) =>
                            item.product_type ===
                              upsellSelectedVariant.product_type &&
                            item.name === upsellSelectedVariant.name &&
                            item.color === upsellSelectedVariant.color &&
                            item.size === upsellSelectedVariant.size,
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
                              image: upsellSelectedVariant.images[0],
                              product_type: upsellSelectedVariant.product_type,
                              name: upsellSelectedVariant.name,
                              color: upsellSelectedVariant.color || '',
                              size: upsellSelectedVariant.size || '',
                              price: upsellSelectedVariant.price,
                              price_before: upsellSelectedVariant.price_before,
                              quantity: count,
                            },
                          ]
                        }
                      })
                      handlers.reset()

                      facebookPixelAddToCart(
                        upsellSelectedVariant.price,
                        count,
                        upsellSelectedVariant.product_type,
                        upsellSelectedVariant.name,
                        upsellSelectedVariant.color,
                        upsellSelectedVariant.size,
                      )

                      googleAnalyticsAddToCart(
                        upsellSelectedVariant.price,
                        count,
                        upsellSelectedVariant.product_type,
                        upsellSelectedVariant.name,
                        upsellSelectedVariant.color,
                        upsellSelectedVariant.size,
                      )
                    }}
                    color="red"
                    size="md"
                    radius="md"
                    style={{ width: '100%' }}
                  >
                    Προσθήκη στο Καλάθι
                  </Button>
                </div>
              </div>
            )}
        </>
      </Modal>

      <main className="flex-1">
        <div className="md:flex">
          <div className="md:w-1/2">
            <Carousel withIndicators>
              {state.images.map((img) => (
                <Carousel.Slide key={img}>
                  <div className="relative aspect-[1/1.15]">
                    <Image
                      src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${img}`}
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
              <Link href={`${ROUTE_COLLECTION}/${paramsProduct_type}`}>
                {paramsProduct_type}
              </Link>
              <p>/</p>
              <h1 className="text-xl xl:text-2xl">{state.selectedVariant}</h1>
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
                {state.price_before > 0 && (
                  <h2 className="text-xl xl:text-2xl text-[var(--mantine-border)] line-through decoration-red-500">{`${state.price_before}€`}</h2>
                )}
                <h2 className="text-xl xl:text-2xl">{`${state.price}€`}</h2>
              </div>
            </div>

            {state.description && (
              <p className="mb-4 whitespace-pre-line proxima-nova xl:text-lg">
                {state.description}
              </p>
            )}

            {state.displayedBrands.length > 1 && (
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
                              dispatch({
                                type: 'brand',
                                payload: { selectedBrand: '' },
                              })
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
                          {state.displayedBrands.length !== 1 && (
                            <hr className="w-full border-t-2 border-[var(--mantine-border)]" />
                          )}
                        </>
                      )}
                      {state.displayedBrands
                        .filter((brand) => brand !== state.selectedBrand)
                        .map((brand, index, array) => (
                          <Fragment key={index}>
                            <div
                              onClick={() => {
                                dispatch({
                                  type: 'brand',
                                  payload: { selectedBrand: brand },
                                })
                                window.history.pushState(
                                  {},
                                  '',
                                  `${ROUTE_PRODUCT}/${paramsProduct_type}`,
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

            {state.displayedVariants.length > 1 && (
              <div id="variant" className="mb-2">
                <div className="flex gap-2 items-center">
                  <h1 className="text-xl xl:text-2xl">Μοντέλο</h1>
                  {doNotFindYourMoto && (
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'variant',
                          payload: {
                            selectedVariant: specialVariant[0],
                          },
                        })
                        window.history.pushState(
                          {},
                          '',
                          `${ROUTE_PRODUCT}/${paramsProduct_type}/${specialVariant[0]}`,
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
                        specialVariant.includes(state.selectedVariant)
                          ? '!italic'
                          : ''
                      }`,
                    }}
                  >
                    {state.selectedVariant}
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
                      {state.displayedVariants
                        .filter((variant) => variant !== state.selectedVariant)
                        .map((variant, index, array) => (
                          <Fragment key={index}>
                            <div
                              onClick={() => {
                                dispatch({
                                  type: 'variant',
                                  payload: { selectedVariant: variant },
                                })
                                window.history.pushState(
                                  {},
                                  '',
                                  `${ROUTE_PRODUCT}/${paramsProduct_type}/${variant}`,
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
                                    specialVariant.includes(variant)
                                      ? '!italic'
                                      : ''
                                  }`,
                                }}
                              >
                                {variant}
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

            {specialVariant.includes(state.selectedVariant) && (
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
                  {state.displayedColors.map((color, index) => {
                    return color === state.selectedColor ? (
                      <div
                        key={index}
                        onClick={() => {
                          dispatch({
                            type: 'color',
                            payload: { selectedColor: color },
                          })
                          window.history.pushState(
                            {},
                            '',
                            `${ROUTE_PRODUCT}/${paramsProduct_type}/${state.selectedVariant}?color=${color}`,
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
                            type: 'color',
                            payload: { selectedColor: color },
                          })
                          window.history.pushState(
                            {},
                            '',
                            `${ROUTE_PRODUCT}/${paramsProduct_type}/${state.selectedVariant}?color=${color}`,
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
              (paramsProduct_type === specialProductType ? (
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
                                onClick={() => {
                                  dispatch({
                                    type: 'size',
                                    payload: { selectedSize: size },
                                  })
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
                        postgresVariants.find(
                          (variant) =>
                            variant.product_type === paramsProduct_type &&
                            variant.name === state.selectedVariant &&
                            variant.color === state.selectedColor &&
                            variant.size === size,
                        )?.sold_out === true

                      return (
                        <div
                          key={index}
                          onClick={() =>
                            dispatch({
                              type: 'size',
                              payload: { selectedSize: size },
                            })
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
                  if (specialVariant.includes(state.selectedVariant)) {
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

                  if (upsellProductVariant) {
                    openUpsellModal()
                  } else {
                    setIsCartOpen(true)
                  }

                  setCart((prev) => {
                    const existingIndex = prev.findIndex(
                      (item) =>
                        item.product_type === paramsProduct_type &&
                        item.name === state.selectedVariant &&
                        item.color === state.selectedColor &&
                        item.size === state.selectedSize,
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
                          image: state.images[0],
                          product_type: paramsProduct_type,
                          name: specialVariant.includes(state.selectedVariant)
                            ? customRef.current!.value.trim()
                            : state.selectedVariant,
                          color: state.selectedColor || '',
                          size: state.selectedSize || '',
                          price: state.price,
                          price_before: state.price_before,
                          quantity: count,
                        },
                      ]
                    }
                  })
                  handlers.reset()

                  facebookPixelAddToCart(
                    state.price,
                    count,
                    paramsProduct_type,
                    state.selectedVariant,
                    state.selectedColor,
                    state.selectedSize,
                  )

                  googleAnalyticsAddToCart(
                    state.price,
                    count,
                    paramsProduct_type,
                    state.selectedVariant,
                    state.selectedColor,
                    state.selectedSize,
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
              <Container size="xl" className="hidden md:block mt-auto w-full">
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
          productType={paramsProduct_type}
          className="md:hidden flex flex-col gap-4 my-8"
        />

        <ProductImages
          images={page.images}
          productType={paramsProduct_type}
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
          {reviews.length > 0 && (
            <div id="reviews" className="mx-4 my-8 md:w-1/2">
              <h1 className="mb-2 text-center text-xl xl:text-2xl">
                Αξιολογήσεις
              </h1>
              {reviews.map((review, index) => (
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
                onChange={(pageNumber) =>
                  setReviews(
                    postgres_reviews.slice(
                      (pageNumber - 1) * 5,
                      pageNumber * 5,
                    ),
                  )
                }
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
                          src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${image}`}
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
            href="#variant"
            scroll={true}
            onClick={() => {
              dispatch({
                type: 'variant',
                payload: {
                  selectedVariant: specialVariant[0],
                },
              })
              window.history.pushState(
                {},
                '',
                `${ROUTE_PRODUCT}/${paramsProduct_type}/${specialVariant[0]}`,
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
