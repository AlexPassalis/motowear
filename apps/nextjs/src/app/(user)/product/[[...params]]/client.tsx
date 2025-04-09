'use client'

import { Dispatch, SetStateAction, useReducer, useRef, useState } from 'react'
import { useCounter, useDisclosure } from '@mantine/hooks'
import {
  Accordion,
  Button,
  Card,
  Container,
  Image,
  Modal,
  Text,
  UnstyledButton,
} from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { ROUTE_COLLECTION, ROUTE_PRODUCT } from '@/data/routes'
import { envClient } from '@/env'
import { IoIosArrowDown } from 'react-icons/io'
import { Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa'
import HeaderProvider from '@/context/HeaderProvider'
import { useHeaderContext } from '@/context/useHeaderContext'
import type { ProductPage, Review, Variants } from '@/data/type'
import { Carousel } from '@mantine/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { Pagination } from '@mantine/core'
import { IoIosStar } from 'react-icons/io'
import { TfiRulerAlt } from 'react-icons/tfi'
import { FaCheck } from 'react-icons/fa'

type ProductPageClientProps = {
  product_types: string[]
  all_variants: Variants
  page: ProductPage
  postgres_reviews: Review[]
  paramsProduct_type: string
  paramsVariant: undefined | Variants[number]
  postgresVariants: Variants
}

export function ProductPageClient({
  product_types,
  all_variants,
  page,
  postgres_reviews,
  paramsProduct_type,
  paramsVariant,
  postgresVariants,
}: ProductPageClientProps) {
  const [brandDropdown, setBrandDropdown] = useState(false)
  const [variantDropdown, setVariantDropdown] = useState(false)

  return (
    <div
      onClick={() => {
        if (brandDropdown) setBrandDropdown(false)
        if (variantDropdown) setVariantDropdown(false)
      }}
    >
      <HeaderProvider product_types={product_types} all_variants={all_variants}>
        <Main
          paramsProduct_type={paramsProduct_type}
          paramsVariant={paramsVariant}
          postgresVariants={postgresVariants}
          page={page}
          postgres_reviews={postgres_reviews}
          brandDropdown={brandDropdown}
          setBrandDropdown={setBrandDropdown}
          variantDropdown={variantDropdown}
          setVariantDropdown={setVariantDropdown}
        />
      </HeaderProvider>
    </div>
  )
}

type MainProps = {
  paramsProduct_type: string
  paramsVariant: undefined | Variants[number]
  postgresVariants: Variants
  page: ProductPage
  postgres_reviews: Review[]
  brandDropdown: boolean
  setBrandDropdown: Dispatch<SetStateAction<boolean>>
  variantDropdown: boolean
  setVariantDropdown: Dispatch<SetStateAction<boolean>>
}

function Main({
  paramsProduct_type,
  paramsVariant,
  postgresVariants,
  page,
  postgres_reviews,
  brandDropdown,
  setBrandDropdown,
  variantDropdown,
  setVariantDropdown,
}: MainProps) {
  const { setCart, setIsCartOpen } = useHeaderContext()

  const fallbackVariant = postgresVariants[0]
  const initialState = {
    displayedBrands: [
      ...new Set(
        postgresVariants.map(product => product.brand).filter(Boolean)
      ),
    ],
    selectedBrand: '',
    displayedVariants: [
      ...new Set(postgresVariants.map(product => product.name)),
    ],
    selectedVariant: paramsVariant ? paramsVariant.name : fallbackVariant.name,
    displayedColors: paramsVariant
      ? [
          ...new Set(
            postgresVariants
              .filter(
                variant => variant.name === paramsVariant.name && variant.color
              )
              .map(product => product.color)
          ),
        ]
      : [
          ...new Set(
            postgresVariants
              .filter(
                variant =>
                  variant.name === fallbackVariant.name && variant.color
              )
              .map(product => product.color)
          ),
        ],
    selectedColor: paramsVariant ? paramsVariant.color : fallbackVariant.color,
    displayedSizes: paramsVariant
      ? [
          ...new Set(
            postgresVariants
              .filter(
                variant => variant.name === paramsVariant.name && variant.size
              )
              .map(product => product.size)
          ),
        ]
      : [
          ...new Set(
            postgresVariants
              .filter(
                variant => variant.name === fallbackVariant.name && variant.size
              )
              .map(product => product.size)
          ),
        ],
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
          const displayedVariants = [
            ...new Set(
              postgresVariants
                .filter(product => product.brand === selectedBrand)
                .map(product => product.name)
            ),
          ]
          const displayedColors = [
            ...new Set(
              postgresVariants
                .filter(product => product.name === displayedVariants[0])
                .map(product => product.color && product.color)
            ),
          ]
          const foundVariant = postgresVariants.find(
            product => product.brand === selectedBrand
          )!
          const displayedSizes = [
            ...new Set(
              postgresVariants
                .filter(product => product.name === displayedVariants[0])
                .map(product => product.size && product.size)
            ),
          ]

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
        const displayedColors = [
          ...new Set(
            postgresVariants
              .filter(product => product.name === selectedVariant)
              .map(product => product.color && product.color)
          ),
        ]
        const foundVariant = postgresVariants.find(
          product => product.name === selectedVariant
        )!
        const displayedSizes = [
          ...new Set(
            postgresVariants
              .filter(product => product.name === selectedVariant)
              .map(product => product.size && product.size)
          ),
        ]

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
          product =>
            product.name === state.selectedVariant &&
            product.color === selectedColor
        )!
        const displayedSizes = postgresVariants
          .filter(product => product.name === state.selectedVariant)
          .filter(product => product.color === selectedColor)
          .map(product => product.size && product.size)

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
  console.log(state)

  const [count, handlers] = useCounter(0, { min: 1, max: 9 })
  const [
    sizeChartModal,
    { open: openSizeChartModal, close: closeSizeChartModal },
  ] = useDisclosure(false)
  const [upsellModal, { open: openUpsellModal, close: closeUpsellModal }] =
    useDisclosure(false)

  const [reviews, setReviews] = useState(postgres_reviews.slice(0, 5))

  const autoplay = useRef(Autoplay({ delay: 3000 }))

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
              component={NextImage}
              src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${page.size_chart}`}
              alt={page.size_chart}
              fill
              style={{ objectFit: 'cover' }}
              priority
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
        title="Upsell"
        centered
      ></Modal>

      <main className="flex-1">
        <div className="md:flex">
          <div className="md:w-1/2">
            <Carousel withIndicators>
              {state.images.map(img => (
                <Carousel.Slide key={img}>
                  <div className="relative aspect-square">
                    <Image
                      component={NextImage}
                      src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${img}`}
                      alt={img}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </div>
                </Carousel.Slide>
              ))}
            </Carousel>
            {page.product_description && (
              <h2 className="m-4 proxima-nova hidden md:block xl:text-lg 2xl:hidden">
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
                <div className="flex items-center">
                  {Array.from(
                    {
                      length: Math.round(
                        postgres_reviews.reduce(
                          (sum, review) => sum + review.rating,
                          0
                        ) / postgres_reviews.length
                      ),
                    },
                    (_, i) => (
                      <IoIosStar
                        key={i}
                        size={18}
                        className="text-yellow-500"
                      />
                    )
                  )}
                  <span className="ml-2 proxima-nova text-sm xl:text-base">
                    ({postgres_reviews.length} κριτικές)
                  </span>
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                {state.price_before > 0 && (
                  <h2 className="text-xl xl:text-2xl text-[var(--mantine-border)] line-through decoration-red-500">{`${state.price_before}€`}</h2>
                )}
                <h2 className="text-xl xl:text-2xl">{`${state.price}€`}</h2>
              </div>
            </div>

            {state.description && (
              <p className="mb-4 proxima-nova text-lg xl:text-xl">
                {state.description}
              </p>
            )}

            {state.displayedBrands.length > 0 && (
              <div className="mb-2">
                <h1 className="text-xl xl:text-2xl">Μάρκα</h1>
                <div
                  onClick={() => setBrandDropdown(prev => !prev)}
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
                      className="proxima-nova text-lg xl:text-xl"
                    >
                      διάλεξε
                    </UnstyledButton>
                  ) : (
                    <div className="relative w-full max-w-96 h-12">
                      <Image
                        component={NextImage}
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
                      className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border rounded-lg mt-0.5"
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
                              className="proxima-nova text-lg xl:text-xl"
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
                        .filter(brand => brand !== state.selectedBrand)
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
                                  `${ROUTE_PRODUCT}/${paramsProduct_type}`
                                )
                              }}
                              className="p-1 border border-white rounded-lg hover:border-red-500"
                            >
                              <div className="relative w-full max-w-96 h-12 hover:cursor-pointer">
                                <Image
                                  component={NextImage}
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

            <div>
              <h1 className="text-xl xl:text-2xl">Εκδωχή</h1>
              {state.displayedVariants.length > 1 ? (
                <>
                  <div
                    onClick={() => setVariantDropdown(prev => !prev)}
                    className={`mb-2 flex items-center pb-0.5 border-2 border-white ${
                      variantDropdown
                        ? 'border-b-white'
                        : 'border-b-[var(--mantine-border)]'
                    } hover:border-2 hover:rounded-lg hover:border-red-500`}
                  >
                    <button
                      style={{
                        height: '48px',
                        width: '100%',
                        textAlign: 'left',
                        marginLeft: '8px',
                        cursor: 'pointer',
                      }}
                      className="proxima-nova text-lg xl:text-xl"
                    >
                      {state.selectedVariant}
                    </button>
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
                        className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border rounded-lg mt-0.5"
                      >
                        {state.displayedVariants
                          .filter(variant => variant !== state.selectedVariant)
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
                                    `${ROUTE_PRODUCT}/${paramsProduct_type}/${variant}`
                                  )
                                }}
                                className="proxima-nova flex justify-center p-1 border border-white rounded-lg hover:border-red-500"
                              >
                                <UnstyledButton
                                  style={{
                                    width: '100%',
                                    height: '36px',
                                  }}
                                  className="hover:cursor-pointer text-lg xl:text-xl"
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
                </>
              ) : (
                <div className="flex items-center pb-0.5 border-1 border-white border-b-[var(--mantine-border)]">
                  <button
                    style={{
                      height: '48px',
                      width: '100%',
                      textAlign: 'left',
                      marginLeft: '8px',
                    }}
                  >
                    {state.selectedVariant}
                  </button>
                </div>
              )}
            </div>

            {state.displayedColors.length > 0 && (
              <div className="mb-2">
                <h1 className="mb-1 text-xl xl:text-2xl">Χρώμα</h1>
                <div className="flex gap-2">
                  {state.displayedColors.map((color, index) => {
                    return color === state.selectedColor ? (
                      <div
                        key={index}
                        onClick={() =>
                          dispatch({
                            type: 'color',
                            payload: { selectedColor: color },
                          })
                        }
                        className={`w-11 h-11 rounded-full p-0.5 border-2 ${
                          state.selectedColor === color
                            ? 'border-black'
                            : 'border-[var(--mantine-border)]'
                        } hover:cursor-pointer`}
                      >
                        <div
                          style={{ backgroundColor: color }}
                          className={'w-full h-full rounded-full'}
                        />
                      </div>
                    ) : (
                      <div
                        key={index}
                        onClick={() =>
                          dispatch({
                            type: 'color',
                            payload: { selectedColor: color },
                          })
                        }
                        style={{ backgroundColor: color }}
                        className="w-11 h-11 rounded-full hover:cursor-pointer"
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {state.displayedSizes.length > 0 && (
              <div className="mb-2">
                <div className="flex gap-2 items-center">
                  <h1 className="mb-1 text-xl xl:text-2xl">Μέγεθος</h1>
                  {page.size_chart && (
                    <div
                      className="ml-auto flex gap-1 hover:cursor-pointer"
                      onClick={() => openSizeChartModal()}
                    >
                      <h2 className="proxima-nova xl:text-lg hover:text-red-500">
                        μεγεθολόγιο
                      </h2>
                      <TfiRulerAlt />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {state.displayedSizes.map((size, index) => (
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
                        }}
                      >
                        {size}
                      </UnstyledButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                onClick={() => {
                  openUpsellModal()
                  setCart(prev => {
                    const existingIndex = prev.findIndex(
                      item =>
                        item.product_type === paramsProduct_type &&
                        item.name === state.selectedVariant &&
                        item.color === state.selectedColor &&
                        item.size === state.selectedSize
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
                          name: state.selectedVariant,
                          color: state.selectedColor,
                          size: state.selectedSize,
                          price: state.price,
                          price_before: state.price_before,
                          quantity: count,
                        },
                      ]
                    }
                  })
                  handlers.reset()
                }}
                color="red"
                size="md"
                radius="md"
                style={{ width: '100%' }}
              >
                Προσθήκη στο Καλάθι
              </Button>
            </div>
            {page.product_description && (
              <h2 className="hidden 2xl:block mx-4 my-8 proxima-nova text-xl">
                {page.product_description}
              </h2>
            )}
            {page.faq.length > 0 && (
              <Container size="xl" className="hidden lg:block mt-auto w-full">
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
                        <Accordion.Control>{faq.question}</Accordion.Control>
                        <Accordion.Panel className="proxima-nova">
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
          <h2 className="mx-4 my-8 proxima-nova md:hidden">
            {page.product_description}
          </h2>
        )}

        {page.faq.length > 0 && (
          <Container size="xl" className="lg:hidden">
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
                    <Accordion.Control>{faq.question}</Accordion.Control>
                    <Accordion.Panel className="proxima-nova">
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
            <div className="mx-4 my-8 md:w-1/2">
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
                  <div className="mb-1 flex items-center">
                    <h2 className="proxima-nova">{review.full_name}</h2>
                    <div className="ml-auto flex items-center">
                      <FaCheck size={18} color="green" className="mr-1" />
                      <p className="proxima-nova">επιβεβαιωμένη αγορά</p>
                    </div>
                  </div>

                  <h2>{review.review}</h2>
                </div>
              ))}
              <Pagination
                total={Math.ceil(postgres_reviews.length / 5)}
                onChange={pageNumber =>
                  setReviews(
                    postgres_reviews.slice((pageNumber - 1) * 5, pageNumber * 5)
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
                  {page.carousel.map(({ image, text }) => (
                    <Carousel.Slide key={image}>
                      <div className="relative aspect-square">
                        <Image
                          component={NextImage}
                          src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${image}`}
                          alt={image}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-60 p-2">
                          <Text className="text-white text-center">{text}</Text>
                        </div>
                      </div>
                    </Carousel.Slide>
                  ))}
                </Carousel>
              </Card.Section>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
