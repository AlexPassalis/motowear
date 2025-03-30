'use client'

import { ProductRow } from '@/data/types'
import { useEffect, useReducer, useState } from 'react'
import { useCounter } from '@mantine/hooks'
import { Button, Image, UnstyledButton } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { ROUTE_COLLECTION, ROUTE_PRODUCT } from '@/data/routes'
import { Header } from '@/components/Header'
import {
  getLocalStorageCart,
  LocalStorageCartItem,
  setLocalStorageCart,
} from '@/utils/localStorage'
import { Carousel } from '@mantine/carousel'
import { envClient } from '@/env'
import { IoIosArrowDown } from 'react-icons/io'
import { Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa'

type ProductPageClientProps = {
  paramsType: string
  searchParamsVersion: undefined | string
  productTypes: string[]
  postgresVersions: ProductRow[]
  uniqueBrands: string[]
  uniqueVersions: string[]
}

export function ProductPageClient({
  productTypes,
  paramsType,
  searchParamsVersion,
  postgresVersions,
  uniqueBrands,
  uniqueVersions,
}: ProductPageClientProps) {
  console.log(postgresVersions)

  const productFound = postgresVersions.find(
    product => product.version === searchParamsVersion
  )
  const fallbackProduct = postgresVersions[0]
  const initialState = {
    selectedBrand: '-',
    displayedVersions: uniqueVersions,
    selectedVersion: searchParamsVersion ?? fallbackProduct.version,
    displayedColors: searchParamsVersion
      ? [
          ...new Set(
            postgresVersions
              .filter(product => product.version === searchParamsVersion)
              .map(product => product.color)
          ),
        ]
      : [
          ...new Set(
            postgresVersions
              .filter(product => product.version === fallbackProduct.version)
              .map(product => product.color)
          ),
        ],
    selectedColor: searchParamsVersion
      ? productFound?.color
      : fallbackProduct.color,
    images: searchParamsVersion ? productFound!.images : fallbackProduct.images,
    description: searchParamsVersion
      ? productFound?.description
      : fallbackProduct.description,
    price: searchParamsVersion ? productFound!.price : fallbackProduct.price,
    price_before: searchParamsVersion
      ? productFound!.price_before
      : fallbackProduct.price_before,
    displayedSizes: searchParamsVersion
      ? [
          ...new Set(
            postgresVersions
              .filter(product => product.version === searchParamsVersion)
              .map(product => product.size)
          ),
        ]
      : [
          ...new Set(
            postgresVersions
              .filter(product => product.version === fallbackProduct.version)
              .map(product => product.size)
          ),
        ],
    selectedSize: searchParamsVersion
      ? productFound?.size
      : fallbackProduct.size,
  }
  type State = typeof initialState
  type Action =
    | { type: 'brand'; payload: { selectedBrand: string } }
    | { type: 'version'; payload: { selectedVersion: string } }
    | { type: 'color'; payload: { selectedColor: string } }
    | { type: 'size'; payload: { selectedSize: string } }
  function reducer(state: State, action: Action) {
    switch (action.type) {
      case 'brand': {
        const selectedBrand = action.payload.selectedBrand
        if (selectedBrand !== initialState.selectedBrand) {
          const displayedVersions = [
            ...new Set(
              postgresVersions
                .filter(product => product.brand === selectedBrand)
                .map(product => product.version)
            ),
          ]
          const displayedColors = [
            ...new Set(
              postgresVersions
                .filter(product => product.version === displayedVersions[0])
                .map(product => product.color)
            ),
          ]
          const foundVersion = postgresVersions.find(
            product => product.brand === selectedBrand
          )!
          const displayedSizes = [
            ...new Set(
              postgresVersions
                .filter(product => product.version === displayedVersions[0])
                .map(product => product.size)
            ),
          ]

          return {
            ...state,
            selectedBrand: selectedBrand,
            displayedVersions: displayedVersions,
            selectedVersion: displayedVersions[0],
            displayedColors: displayedColors,
            selectedColor: displayedColors[0],
            images: foundVersion.images,
            description: foundVersion.description,
            price: foundVersion.price,
            price_before: foundVersion.price_before,
            displayedSizes: displayedSizes,
            selectedSize: displayedSizes[0],
          }
        } else {
          return {
            ...state,
            selectedBrand: selectedBrand,
            displayedVersions: initialState.displayedVersions,
          }
        }
      }
      case 'version': {
        const selectedVersion = action.payload.selectedVersion
        const displayedColors = [
          ...new Set(
            postgresVersions
              .filter(product => product.version === selectedVersion)
              .map(product => product.color)
          ),
        ]
        const foundVersion = postgresVersions.find(
          product => product.version === selectedVersion
        )!
        const displayedSizes = [
          ...new Set(
            postgresVersions
              .filter(product => product.version === selectedVersion)
              .map(product => product.size)
          ),
        ]

        return {
          ...state,
          selectedVersion: selectedVersion,
          displayedColors: displayedColors,
          selectedColor: displayedColors[0],
          images: foundVersion.images,
          description: foundVersion.description,
          price: foundVersion.price,
          price_before: foundVersion.price_before,
          displayedSizes: displayedSizes,
          selectedSize: displayedSizes[0],
        }
      }
      case 'color': {
        const selectedColor = action.payload.selectedColor
        const foundVersion = postgresVersions.find(
          product =>
            product.version === state.selectedVersion &&
            product.color === selectedColor
        )!
        const displayedSizes = postgresVersions
          .filter(product => product.version === state.selectedVersion)
          .filter(product => product.color === selectedColor)
          .map(product => product.size)

        return {
          ...state,
          selectedColor: selectedColor,
          images: foundVersion.images,
          description: foundVersion.description,
          price: foundVersion.price,
          price_before: foundVersion.price_before,
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

  const [brandDropdown, setBrandDropdown] = useState(false)
  const [versionDropdown, setVersionDropdown] = useState(false)

  function carouselSlides() {
    return state.images.map(url => (
      <Carousel.Slide key={url}>
        <Image
          component={NextImage}
          src={`${envClient.MINIO_PRODUCT_URL}/${paramsType}/${url}`}
          alt={url}
          fill
          // objectFit="contain"
        />
      </Carousel.Slide>
    ))
  }

  const [cart, setCart] = useState<LocalStorageCartItem[]>([])
  useEffect(() => {
    setCart(getLocalStorageCart())
  }, [])
  useEffect(() => {
    setLocalStorageCart(cart)
  }, [cart])

  const [count, handlers] = useCounter(0, { min: 1, max: 9 })

  return (
    <>
      <Header productTypes={productTypes} cart={cart} setCart={setCart} />
      <Carousel withIndicators height={500}>
        {carouselSlides()}
      </Carousel>
      <div className="flex flex-col gap-2 m-4">
        <div className="flex gap-2 text-lg">
          <Link href={`${ROUTE_COLLECTION}/${paramsType}`}>{paramsType}</Link>
          <p>/</p>
          <h1>{state.selectedVersion}</h1>
          <div className="flex gap-2 ml-auto">
            <h2>{`${state.price}€`}</h2>
            {state.price_before && (
              <h2
                style={{
                  textDecorationLine: 'line-through',
                  textDecorationColor: 'red',
                }}
                className="text-gray-400"
              >{`${state.price_before}€`}</h2>
            )}
            {state.price_before && (
              <h2 className="text-green-500">{`-${(
                ((state.price_before - state.price) / state.price_before) *
                100
              ).toFixed(0)}%`}</h2>
            )}
          </div>
        </div>

        {state.description && <p className="my-2">{state.description}</p>}

        {uniqueBrands.length > 0 && (
          <div>
            <h1 className="text-lg">Μάρκα</h1>
            <div
              className={`flex items-center pb-0.5 ${
                !brandDropdown ? 'border-b border-gray-400' : ''
              }`}
            >
              {state.selectedBrand === '-' ? (
                <UnstyledButton
                  onClick={() => setBrandDropdown(prev => !prev)}
                  style={{
                    height: '48px',
                    width: '100%',
                    marginLeft: '8px',
                  }}
                >
                  διάλεξε
                </UnstyledButton>
              ) : (
                <div
                  onClick={() => setBrandDropdown(prev => !prev)}
                  className="relative w-full max-w-96 h-12"
                >
                  <Image
                    component={NextImage}
                    src={`${envClient.MINIO_PRODUCT_URL}/brand/${state.selectedBrand}`}
                    alt={state.selectedBrand}
                    fill
                  />
                </div>
              )}
              <motion.span
                className="ml-auto"
                initial={{ rotate: 0 }}
                animate={{ rotate: brandDropdown ? 180 : 0 }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
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
                    duration: 0.1,
                    ease: 'easeInOut',
                  }}
                  className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border"
                >
                  {state.selectedBrand !== '-' && (
                    <>
                      <div className="border p-1">
                        <UnstyledButton
                          onClick={() => {
                            dispatch({
                              type: 'brand',
                              payload: { selectedBrand: '-' },
                            })
                            setBrandDropdown(prev => !prev)
                          }}
                          style={{
                            width: '100%',
                            height: '48px',
                          }}
                          className="flex-shrink-0"
                        >
                          καμία μάρκα
                        </UnstyledButton>
                      </div>
                      <hr className="w-full border-t border-gray-400" />
                    </>
                  )}
                  {uniqueBrands
                    .filter(brand => brand !== state.selectedBrand)
                    .map((brand, index, array) => (
                      <Fragment key={index}>
                        <div className="border p-1">
                          <div
                            onClick={() => {
                              dispatch({
                                type: 'brand',
                                payload: { selectedBrand: brand },
                              })
                              setBrandDropdown(prev => !prev)
                              window.history.pushState(
                                {},
                                '',
                                `${ROUTE_PRODUCT}/${paramsType}`
                              )
                            }}
                            className="relative w-full max-w-96 h-12 flex-shrink-0"
                          >
                            <Image
                              component={NextImage}
                              src={`${envClient.MINIO_PRODUCT_URL}/brand/${brand}`}
                              alt={brand}
                              fill
                            />
                          </div>
                        </div>
                        {index !== array.length - 1 && (
                          <hr className="w-full border-t border-gray-400" />
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
          <div
            className={`flex items-center pb-0.5 ${
              !versionDropdown ? 'border-b border-gray-400' : ''
            }`}
          >
            <button
              onClick={() => setVersionDropdown(prev => !prev)}
              style={{
                height: '48px',
                width: '100%',
                textAlign: 'left',
                marginLeft: '8px',
              }}
            >
              {state.selectedVersion}
            </button>
            <motion.span
              className="ml-auto"
              initial={{ rotate: 0 }}
              animate={{ rotate: versionDropdown ? 180 : 0 }}
              transition={{ duration: 0.1, ease: 'easeInOut' }}
            >
              <IoIosArrowDown />
            </motion.span>
          </div>
          <AnimatePresence>
            {versionDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.1,
                  ease: 'easeInOut',
                }}
                className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border"
              >
                {uniqueVersions
                  .filter(version => version !== state.selectedVersion)
                  .map((version, index, array) => (
                    <Fragment key={index}>
                      <div className="border p-1">
                        <button
                          onClick={() => {
                            dispatch({
                              type: 'version',
                              payload: { selectedVersion: version },
                            })
                            setVersionDropdown(prev => !prev)
                            window.history.pushState(
                              {},
                              '',
                              `${ROUTE_PRODUCT}/${paramsType}/${version}`
                            )
                          }}
                          className="relative w-full max-w-96 h-12 flex-shrink-0 text-left"
                        >
                          {version}
                        </button>
                      </div>
                      {index !== array.length - 1 && (
                        <hr className="w-full border-t border-gray-400" />
                      )}
                    </Fragment>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {state.displayedColors.length > 0 && (
          <div>
            <h1 className="text-lg">Χρώμα</h1>
            <div className="flex gap-2">
              {state.displayedColors.map((color, index) => (
                <div
                  key={index}
                  className={`w-12 h-[42px] p-0.5 border-2 ${
                    state.selectedColor === color
                      ? 'border-black'
                      : 'border-gray-400'
                  }`}
                >
                  <UnstyledButton
                    onClick={() =>
                      dispatch({
                        type: 'color',
                        payload: { selectedColor: color },
                      })
                    }
                    size="md"
                    style={{
                      backgroundColor: color,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {state.displayedSizes.length > 0 && (
          <div>
            <h1 className="text-lg">Μέγεθος</h1>
            <div className="flex gap-2">
              {state.displayedSizes.map((size, index) => (
                <div
                  key={index}
                  className={`w-12 h-[42px] border-2 ${
                    state.selectedSize === size
                      ? 'border-black'
                      : 'border-gray-400'
                  }`}
                >
                  <UnstyledButton
                    onClick={() =>
                      dispatch({
                        type: 'size',
                        payload: { selectedSize: size },
                      })
                    }
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

        <div className="flex gap-2 w-full justify-center items-center">
          <div className="flex w-24 h-[42px] border-2 border-gray-400">
            <div className="flex w-1/2 items-center justify-center border-r-1 border-gray-400">
              <p>{count}</p>
            </div>
            <div className="flex flex-col w-1/2">
              <UnstyledButton
                onClick={() => handlers.increment()}
                color="green"
                size="compact-sm"
                style={{
                  width: '100%',
                  height: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderBottom: '0.5px solid grey',
                }}
              >
                <FaPlus />
              </UnstyledButton>
              <UnstyledButton
                onClick={() => handlers.decrement()}
                color="red"
                size="compact-sm"
                style={{
                  width: '100%',
                  height: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FaMinus />
              </UnstyledButton>
            </div>
          </div>
          <Button
            onClick={() => {
              setCart(prev => {
                const existingIndex = prev.findIndex(
                  item =>
                    item.type === paramsType &&
                    item.version === state.selectedVersion &&
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
                      type: paramsType,
                      version: state.selectedVersion,
                      image: state.images[0],
                      price: state.price,
                      quantity: count,
                      ...(state.selectedColor
                        ? { color: state.selectedColor }
                        : {}),
                      ...(state.selectedSize
                        ? { selectedSize: state.selectedSize }
                        : {}),
                      ...(state.price_before
                        ? { price_before: state.price_before }
                        : {}),
                    },
                  ]
                }
              })
              handlers.reset()
            }}
            size="md"
            radius="xs"
            style={{ width: '100%' }}
          >
            Προσθήκη στο Καλάθι
          </Button>
        </div>
      </div>
    </>
  )
}

{
  /* <div className="flex justify-between m-2">
        <Button
          size="compact-sm"
          onClick={() => {
            openModal()
            setModalVersion('version')
          }}
        >
          Διάλεξε εκδωχή
        </Button>
        <Button
          size="compact-sm"
          onClick={() => {
            openModal()
            setModalVersion('brand')
          }}
        >
          Διάλεξε μάρκα
        </Button>
      </div> */
}

{
  /* <div className="flex items-center m-2">
        <h1 className="mr-2">Περιγραφή</h1>
        <textarea value={state.description} readOnly={true} />
      </div>

      <div className="flex items-center m-2">
        <h1 className="mr-2">Μεγέθοι</h1>
        <div className="flex gap-2">{state.displayedSize}</div>
      </div> */
}

{
  /* <div className="flex items-center gap-2 m-2">
        <h1>Τιμή</h1>
        {state.price_before && (
          <span className="text-gray-500 line-through">
            {state.price_before}€
          </span>
        )}
        <span className="font-bold">{state.price}€</span>
        {state.price_before && (
          <span className="text-green-700">
            (Κερδίζεις {state.price_before - state.price}€)
          </span>
        )}
      </div>

      <div className="inline-flex items-center gap-3 m-2 border">
        <Button onClick={handlers.decrement}>-</Button>
        <h1 className="">{count}</h1>
        <Button onClick={handlers.increment}>+</Button>
      </div> */
}
