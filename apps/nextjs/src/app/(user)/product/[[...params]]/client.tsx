'use client'

import { ProductRow } from '@/data/types'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { useCounter, useDisclosure } from '@mantine/hooks'
import { Button, Image, Modal, UnstyledButton } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { ROUTE_COLLECTION, ROUTE_PRODUCT } from '@/data/routes'
import { Carousel } from '@mantine/carousel'
import { envClient } from '@/env'
import { IoIosArrowDown } from 'react-icons/io'
import { Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa'
import HeaderProvider from '@/context/HeaderProvider'
import { useHeaderContext } from '@/context/useHeaderContext'

type ProductPageClientProps = {
  productTypes: string[]
  paramsType: string
  paramsVersion: undefined | string
  postgresVersions: ProductRow[]
  uniqueBrands: string[]
  uniqueVersions: string[]
}

export function ProductPageClient({
  productTypes,
  paramsType,
  paramsVersion,
  postgresVersions,
  uniqueBrands,
  uniqueVersions,
}: ProductPageClientProps) {
  const [brandDropdown, setBrandDropdown] = useState(false)
  const [versionDropdown, setVersionDropdown] = useState(false)

  return (
    <div
      onClick={() => {
        if (brandDropdown) setBrandDropdown(false)
        if (versionDropdown) setVersionDropdown(false)
      }}
    >
      <HeaderProvider productTypes={productTypes}>
        <Main
          paramsType={paramsType}
          paramsVersion={paramsVersion}
          postgresVersions={postgresVersions}
          uniqueBrands={uniqueBrands}
          uniqueVersions={uniqueVersions}
          brandDropdown={brandDropdown}
          setBrandDropdown={setBrandDropdown}
          versionDropdown={versionDropdown}
          setVersionDropdown={setVersionDropdown}
        />
      </HeaderProvider>
    </div>
  )
}

type MainProps = {
  paramsType: string
  paramsVersion: undefined | string
  postgresVersions: ProductRow[]
  uniqueBrands: string[]
  uniqueVersions: string[]
  brandDropdown: boolean
  setBrandDropdown: Dispatch<SetStateAction<boolean>>
  versionDropdown: boolean
  setVersionDropdown: Dispatch<SetStateAction<boolean>>
}

function Main({
  paramsType,
  paramsVersion,
  postgresVersions,
  uniqueBrands,
  uniqueVersions,
  brandDropdown,
  setBrandDropdown,
  versionDropdown,
  setVersionDropdown,
}: MainProps) {
  const { setCart, setIsCartOpen } = useHeaderContext()

  const productFound = postgresVersions.find(
    product => product.version === paramsVersion
  )
  const fallbackProduct = postgresVersions[0]
  const initialState = {
    selectedBrand: '-',
    displayedVersions: uniqueVersions,
    selectedVersion: paramsVersion ?? fallbackProduct.version,
    displayedColors: paramsVersion
      ? [
          ...new Set(
            postgresVersions
              .filter(product => product.version === paramsVersion)
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
    selectedColor: paramsVersion ? productFound?.color : fallbackProduct.color,
    images: paramsVersion ? productFound!.images : fallbackProduct.images,
    description: paramsVersion
      ? productFound?.description
      : fallbackProduct.description,
    price: paramsVersion ? productFound!.price : fallbackProduct.price,
    price_before: paramsVersion
      ? productFound!.price_before
      : fallbackProduct.price_before,
    displayedSizes: paramsVersion
      ? [
          ...new Set(
            postgresVersions
              .filter(product => product.version === paramsVersion)
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
    selectedSize: paramsVersion ? productFound?.size : fallbackProduct.size,
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
  console.log(state)

  const [count, handlers] = useCounter(0, { min: 1, max: 9 })
  const [opened, { open, close }] = useDisclosure(false)
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else {
      if (!opened) {
        setIsCartOpen(true)
      }
    }
  }, [opened])

  return (
    <main>
      <Modal opened={opened} onClose={close} title="Upsell" centered></Modal>

      <Carousel withIndicators height={500}>
        {state.images.map(url => (
          <Carousel.Slide key={url}>
            <Image
              component={NextImage}
              src={`${envClient.MINIO_PRODUCT_URL}/${paramsType}/${url}`}
              alt={url}
              fill
              priority
            />
          </Carousel.Slide>
        ))}
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
              className={`flex items-center pb-0.5 border-1 border-white ${
                brandDropdown ? 'border-b-white' : 'border-b-gray-400'
              } hover:border hover:rounded-lg hover:border-red-500`}
            >
              {state.selectedBrand === '-' ? (
                <UnstyledButton
                  onClick={() => setBrandDropdown(prev => !prev)}
                  style={{
                    height: '48px',
                    width: '100%',
                    marginLeft: '8px',
                    cursor: 'pointer',
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
                  className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border mt-0.5"
                >
                  {state.selectedBrand !== '-' && (
                    <>
                      <div
                        onClick={() =>
                          dispatch({
                            type: 'brand',
                            payload: { selectedBrand: '-' },
                          })
                        }
                        className="p-1 border rounded-lg hover:border-red-500"
                      >
                        <UnstyledButton
                          style={{
                            width: '100%',
                            height: '48px',
                            textAlign: 'center',
                          }}
                          className="hover:cursor-pointer"
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
                        <div
                          onClick={() => {
                            dispatch({
                              type: 'brand',
                              payload: { selectedBrand: brand },
                            })
                            window.history.pushState(
                              {},
                              '',
                              `${ROUTE_PRODUCT}/${paramsType}`
                            )
                          }}
                          className="p-1 border rounded-lg hover:border-red-500"
                        >
                          <div className="relative mx-auto w-full max-w-96 h-12 hover:cursor-pointer">
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
            className={`flex items-center pb-0.5 border-1 border-white ${
              versionDropdown ? 'border-b-white' : 'border-b-gray-400'
            } hover:border hover:rounded-lg hover:border-red-500`}
          >
            <button
              onClick={() => setVersionDropdown(prev => !prev)}
              style={{
                height: '48px',
                width: '100%',
                textAlign: 'left',
                marginLeft: '8px',
                cursor: 'pointer',
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
                className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border mt-0.5"
              >
                {uniqueVersions
                  .filter(version => version !== state.selectedVersion)
                  .map((version, index, array) => (
                    <Fragment key={index}>
                      <div
                        onClick={() => {
                          dispatch({
                            type: 'version',
                            payload: { selectedVersion: version },
                          })
                          window.history.pushState(
                            {},
                            '',
                            `${ROUTE_PRODUCT}/${paramsType}/${version}`
                          )
                        }}
                        className="flex justify-center p-1 border rounded-lg hover:border-red-500"
                      >
                        <UnstyledButton
                          style={{
                            width: '100%',
                            height: '48px',
                            textAlign: 'center',
                          }}
                          className="hover:cursor-pointer"
                        >
                          {version}
                        </UnstyledButton>
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
              {state.displayedColors.map((color, index) =>
                color === state.selectedColor ? (
                  <div
                    key={index}
                    className={`w-11 h-11 rounded-full p-0.5 border-2 ${
                      state.selectedColor === color
                        ? 'border-black'
                        : 'border-gray-400'
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
                    style={{ backgroundColor: color }}
                    className="w-11 h-11 rounded-full hover:cursor-pointer"
                  />
                )
              )}
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
                  className={`w-12 h-[42px] border-2 rounded-lg ${
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

        <div className="flex gap-2 w-full justify-center items-center mt-2">
          <div className="flex w-24 h-[42px] rounded-lg border-2 border-gray-400">
            <div className="w-1/3">
              <UnstyledButton
                onClick={() => handlers.decrement()}
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
            <div className="flex w-1/3 items-center justify-center border-x-1 border-gray-400">
              <p>{count}</p>
            </div>
            <div className="w-1/3">
              <UnstyledButton
                onClick={() => handlers.increment()}
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
              open()
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
                        ? { size: state.selectedSize }
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
            color="red"
            size="md"
            radius="md"
            style={{ width: '100%' }}
          >
            Προσθήκη στο Καλάθι
          </Button>
        </div>
      </div>
    </main>
  )
}
