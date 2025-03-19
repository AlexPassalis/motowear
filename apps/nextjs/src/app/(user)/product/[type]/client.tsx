'use client'

import { ProductRow } from '@/data/types'
import { useRouter } from 'next/navigation'
import { useEffect, useReducer, useState } from 'react'
import { useDisclosure, useCounter } from '@mantine/hooks'
import { Modal, Button, Image } from '@mantine/core'
import { ROUTE_PRODUCT } from '@/data/routes'
import { Header } from '@/components/Header'
import {
  getLocalStorageCart,
  LocalStorageCartItem,
  setLocalStorageCart,
} from '@/utils/localStorage'
import NextImage from 'next/image'
import { Carousel } from '@mantine/carousel'
import { envClient } from '@/env'

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
  const router = useRouter()

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
      ? postgresVersions
          .filter(product => product.version === searchParamsVersion)
          .map(product => product.color)
      : postgresVersions
          .filter(product => product.version === fallbackProduct.version)
          .map(product => product.color),
    selectedColor: searchParamsVersion
      ? productFound?.color ?? fallbackProduct.color
      : fallbackProduct.color,
    images: searchParamsVersion
      ? productFound?.images ?? fallbackProduct.images
      : fallbackProduct.images,
    description: searchParamsVersion
      ? productFound?.description ?? fallbackProduct.description
      : fallbackProduct.description,
    price: searchParamsVersion
      ? productFound?.price ?? fallbackProduct.price
      : fallbackProduct.price,
    price_before: searchParamsVersion
      ? productFound?.price_before ?? fallbackProduct.price_before
      : fallbackProduct.price_before,
    displayedSizes: searchParamsVersion
      ? productFound?.sizes ?? fallbackProduct.sizes
      : fallbackProduct.sizes,
    selectedSize: searchParamsVersion
      ? productFound?.sizes[0] ?? fallbackProduct.sizes[0]
      : fallbackProduct.sizes[0],
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
          const displayedColors = postgresVersions
            .filter(product => product.brand === selectedBrand)
            .filter(product => product.version === displayedVersions[0])
            .map(product => product.color)
          const foundVersion = postgresVersions.find(
            product => product.brand === selectedBrand
          )!

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
            displayedSizes: foundVersion.sizes,
            selectedSize: foundVersion.sizes[0],
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
        const displayedColors = postgresVersions
          .filter(product => product.version === selectedVersion)
          .map(product => product.color)
        const foundVersion = postgresVersions.find(
          product => product.version === selectedVersion
        )!

        return {
          ...state,
          selectedVersion: selectedVersion,
          displayedColors: displayedColors,
          selectedColor: displayedColors[0],
          images: foundVersion.images,
          description: foundVersion.description,
          price: foundVersion.price,
          price_before: foundVersion.price_before,
          displayedSizes: foundVersion.sizes,
          selectedSize: foundVersion.sizes[0],
        }
      }
      case 'color': {
        const selectedColor = action.payload.selectedColor
        const foundVersion = postgresVersions.find(
          product =>
            product.version === state.selectedVersion &&
            product.color === selectedColor
        )!
        return {
          ...state,
          selectedColor: selectedColor,
          images: foundVersion.images,
          description: foundVersion.description,
          price: foundVersion.price,
          price_before: foundVersion.price_before,
          displayedSizes: foundVersion.sizes,
          selectedSize: foundVersion.sizes[0],
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

  const [openedModal, { open: openModal, close: closeModal }] =
    useDisclosure(false)
  const [modalVersion, setModalVersion] = useState<
    typeof initialState.selectedBrand | 'brand' | 'version'
  >(initialState.selectedBrand)
  function renderModalContent() {
    switch (modalVersion) {
      case 'brand':
        return (
          <>
            <Button
              onClick={() => {
                dispatch({
                  type: 'brand',
                  payload: { selectedBrand: initialState.selectedBrand },
                })
                closeModal()
              }}
              style={
                state.selectedBrand === initialState.selectedBrand
                  ? { border: '2px solid black' }
                  : {}
              }
            >
              {initialState.selectedBrand}
            </Button>
            {uniqueBrands.map(brand => (
              <Button
                key={brand}
                onClick={() => {
                  dispatch({
                    type: 'brand',
                    payload: { selectedBrand: brand },
                  })
                  closeModal()
                  router.push(`${ROUTE_PRODUCT}/${paramsType}`)
                }}
                style={
                  state.selectedBrand === brand
                    ? { border: '2px solid black' }
                    : {}
                }
              >
                {brand}
              </Button>
            ))}
          </>
        )
      case 'version':
        return (
          <>
            {state.displayedVersions.map(version => (
              <Button
                key={version}
                onClick={() => {
                  dispatch({
                    type: 'version',
                    payload: { selectedVersion: version },
                  })
                  closeModal()
                  router.push(
                    `${ROUTE_PRODUCT}/${paramsType}?version=${version}`
                  )
                }}
                style={
                  state.selectedVersion === version
                    ? { border: '2px solid black' }
                    : {}
                }
              >
                {version}
              </Button>
            ))}
          </>
        )
      default:
        return <p>unknown modal version</p>
    }
  }

  function carouselSlides() {
    return state.images.map(url => (
      <Carousel.Slide key={url}>
        <Image
          component={NextImage}
          src={`${envClient.MINIO_PRODUCT_URL}/${paramsType}/${state.selectedVersion}/${url}`}
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
      <Modal
        opened={openedModal}
        onClose={closeModal}
        title="Διάλεξε εκδωχή: "
        centered
      >
        <div className="flex flex-col gap-2">{renderModalContent()}</div>
      </Modal>

      <Header productTypes={productTypes} cart={cart} setCart={setCart} />

      <Carousel withIndicators height={400}>
        {carouselSlides()}
      </Carousel>

      <div className="flex justify-between m-2">
        <h1>{state.selectedVersion}</h1>
        <h1>{state.selectedBrand}</h1>
      </div>

      <div className="flex justify-between m-2">
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
      </div>

      <div className="flex items-center m-2">
        <h1 className="mr-2">Χρώματα</h1>
        <div className="flex gap-2">
          {state.displayedColors.map(color => {
            function handleOnClick() {
              dispatch({ type: 'color', payload: { selectedColor: color } })
            }
            return color === state.selectedColor ? (
              <button
                key={color}
                onClick={() => handleOnClick()}
                className="w-10 h-10 rounded-full border hover:cursor-pointer flex items-center justify-center"
              >
                <div className={`bg-${color} w-9 h-9 rounded-full`} />
              </button>
            ) : (
              <button
                key={color}
                onClick={() => handleOnClick()}
                className={`bg-${color} w-10 h-10 rounded-full hover:cursor-pointer`}
              />
            )
          })}
        </div>
      </div>

      <div className="flex items-center m-2">
        <h1 className="mr-2">Περιγραφή</h1>
        <textarea value={state.description} readOnly={true} />
      </div>

      <div className="flex items-center m-2">
        <h1 className="mr-2">Μεγέθοι</h1>
        <div className="flex gap-2">
          {state.displayedSizes.map(size => (
            <Button
              key={size}
              onClick={() =>
                dispatch({ type: 'size', payload: { selectedSize: size } })
              }
              style={
                size === state.selectedSize ? { border: '2px solid black' } : {}
              }
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 m-2">
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
      </div>

      <div className="m-2">
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
                    color: state.selectedColor,
                    image: state.images[0],
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
        >
          Προσθήκη στο Καλάθι
        </Button>
      </div>
    </>
  )
}
