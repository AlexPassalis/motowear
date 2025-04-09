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
          <div className="h-96 w-96">
            <Image
              component={NextImage}
              src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${page.size_chart}`}
              alt={page.size_chart}
              fill
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

      <main>
        <Carousel withIndicators height={500}>
          {state.images.map(img => (
            <Carousel.Slide key={img}>
              <Image
                component={NextImage}
                src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${img}`}
                alt={img}
                fill
                priority
              />
            </Carousel.Slide>
          ))}
        </Carousel>

        <div className="m-4 mb-8">
          <div className="flex gap-2 text-xl">
            <Link href={`${ROUTE_COLLECTION}/${paramsProduct_type}`}>
              {paramsProduct_type}
            </Link>
            <p>/</p>
            <h1>{state.selectedVariant}</h1>
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
                    <IoIosStar key={i} size={18} className="text-yellow-500" />
                  )
                )}
                <span className="ml-2 proxima-nova text-sm">
                  ({postgres_reviews.length} κριτικές)
                </span>
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              {state.price_before > 0 && (
                <h2 className="text-xl text-[var(--mantine-border)] relative custom-strike">{`${state.price_before}€`}</h2>
              )}
              <h2 className="text-xl">{`${state.price}€`}</h2>
            </div>
          </div>

          {state.description && (
            <p className="mb-4 proxima-nova">{state.description}</p>
          )}

          {state.displayedBrands.length > 0 && (
            <div className="mb-2">
              <h1 className="text-lg">Μάρκα</h1>
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
                    className="proxima-nova"
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
                    className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border mt-0.5"
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
            <h1 className="text-lg">Εκδωχή</h1>
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
                    className="proxima-nova"
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
                      className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border mt-0.5"
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
                                className="hover:cursor-pointer"
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
              <h1 className="mb-1 text-lg">Χρώμα</h1>
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
                <h1 className="mb-1 text-lg">Μέγεθος</h1>
                {page.size_chart && (
                  <div
                    className="ml-auto flex gap-1 hover:cursor-pointer"
                    onClick={() => openSizeChartModal()}
                  >
                    <TfiRulerAlt />
                    <h2 className="proxima-nova hover:text-red-700">
                      μεγεθολόγιο
                    </h2>
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

          <div className="mt-6 flex gap-2 w-full justify-center items-center">
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
                      item.procuct_type === paramsProduct_type &&
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
                        procuct_type: paramsProduct_type,
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
        </div>

        {page.product_description && (
          <h2 className="mx-4 my-8 proxima-nova">{page.product_description}</h2>
        )}

        {page.faq.length > 0 && (
          <Container size="xs">
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

        {reviews.length > 0 && (
          <div className="mx-4 my-8">
            <h1 className="mb-2 text-center text-xl">Αξιολογήσεις</h1>
            {reviews.map((review, index) => (
              <div
                key={index}
                className={`p-2 border-[var(--mantine-border)] border-b-2 ${
                  index === 0 ? 'border-t-2' : ''
                }`}
              >
                <div className="flex mb-1">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <IoIosStar key={i} size={18} className="text-yellow-500" />
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
          <Card radius="md" withBorder padding="xl" className="m-4 mb-8">
            <Card.Section>
              <Carousel
                withIndicators
                loop
                plugins={[autoplay.current]}
                height={500}
              >
                {page.carousel.map(({ image, text }) => (
                  <Carousel.Slide key={image}>
                    <div className="relative w-full h-3/4">
                      <Image
                        component={NextImage}
                        src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${image}`}
                        alt={image}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="w-full h-1/4 p-4 flex items-center justify-center">
                      <Text fw={500} fz="lg">
                        {text}
                      </Text>
                    </div>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Card.Section>
          </Card>
        )}
      </main>
    </>
  )
}
