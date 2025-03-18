'use client'

import { ProductRow } from '@/data/types'
import { redirect, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDisclosure, useCounter } from '@mantine/hooks'
import { Modal, Button, Image } from '@mantine/core'
import { ROUTE_ERROR, ROUTE_PRODUCT } from '@/data/routes'
import { Header } from '@/components/Header'
import {
  getLocalStorageCart,
  LocalStorageCart,
  setLocalStorageCart,
} from '@/utils/localStorage'
import NextImage from 'next/image'
import { Carousel } from '@mantine/carousel'
import { env } from '@/env'

type ProductPageClientProps = {
  paramsType: string
  searchParamsVersion: undefined | string
  productTypes: string[]
  postgresVersions: ProductRow[]
  displayedBrands: string[]
  uniqueVersions: string[]
}

export function ProductPageClient({
  productTypes,
  paramsType,
  searchParamsVersion,
  postgresVersions,
  displayedBrands,
  uniqueVersions,
}: ProductPageClientProps) {
  const router = useRouter()

  console.log(paramsType)

  const defaultSelectedBrand = '-'

  const defaultSelectedVersion =
    searchParamsVersion ?? postgresVersions[0].version

  const defaultColorVersions = postgresVersions
    .filter(product => product.version === searchParamsVersion)
    .map(product => product.color)
  const colorVersions = postgresVersions
    .filter(product => product.version === postgresVersions[0].version)
    .map(product => product.color)

  const defaultDisplayedColors = searchParamsVersion
    ? defaultColorVersions.length !== 0
      ? defaultColorVersions
      : colorVersions
    : colorVersions
  const defaultSelectedColor = searchParamsVersion
    ? postgresVersions.find(product => product.version === searchParamsVersion)
        ?.color ?? postgresVersions[0].color
    : postgresVersions[0].color

  const defaultImages = searchParamsVersion
    ? postgresVersions.find(product => product.version === searchParamsVersion)
        ?.images ?? postgresVersions[0].images
    : postgresVersions[0].images
  const defaultDisplayedImages = defaultImages.map(
    image =>
      `${env.MINIO_PRODUCT_URL}/${paramsType}/${defaultSelectedVersion}/${image}`
  )

  const defaultDescription = searchParamsVersion
    ? postgresVersions.find(product => product.version === searchParamsVersion)
        ?.description ?? postgresVersions[0].description
    : postgresVersions[0].description

  const defaultSizesVersions = postgresVersions.find(
    product => product.version === searchParamsVersion
  )?.sizes
  const sizesVersions = postgresVersions[0].sizes

  const defaultDisplayedSizes = searchParamsVersion
    ? defaultSizesVersions ?? sizesVersions
    : sizesVersions

  const defaultSelectedSize = searchParamsVersion
    ? defaultSizesVersions
      ? defaultSizesVersions[0]
      : sizesVersions[0]
    : sizesVersions[0]

  const defaultPrice = searchParamsVersion
    ? postgresVersions.find(product => product.version === searchParamsVersion)
        ?.price ?? postgresVersions[0].price
    : postgresVersions[0].price

  const defaultPriceBefore = searchParamsVersion
    ? postgresVersions.find(product => product.version === searchParamsVersion)
        ?.price_before ?? postgresVersions[0].price_before
    : postgresVersions[0].price_before

  const [versionState, setVersionState] = useState({
    selectedBrand: defaultSelectedBrand,
    displayedVersions: uniqueVersions,
    selectedVersion: defaultSelectedVersion,
    displayedColors: defaultDisplayedColors,
    selectedColor: defaultSelectedColor,
    displayedImages: defaultDisplayedImages,
    description: defaultDescription,
    displayedSizes: defaultDisplayedSizes,
    selectedSize: defaultSelectedSize,
    price: defaultPrice,
    price_before: defaultPriceBefore,
  })
  useEffect(() => {
    console.log(versionState)
  }, [versionState])

  const [openedModal, { open: openModal, close: closeModal }] =
    useDisclosure(false)
  const [modalVersion, setModalVersion] = useState<
    typeof defaultSelectedBrand | 'brand' | 'version'
  >(defaultSelectedBrand)
  function renderModalContent() {
    switch (modalVersion) {
      case 'brand':
        return (
          <>
            <Button
              onClick={() => {
                setVersionState(prev => ({
                  ...prev,
                  selectedBrand: defaultSelectedBrand,
                  displayedVersions: uniqueVersions,
                }))
                closeModal()
              }}
              className="border border-black p-2 hover:cursor-pointer"
            >
              {defaultSelectedBrand}
            </Button>
            {displayedBrands.map(brand => (
              <Button
                key={brand}
                onClick={() => {
                  const findBrand = postgresVersions.find(
                    product => product.brand === brand
                  )
                  setVersionState(prev => ({
                    ...prev,
                    selectedBrand: brand,
                    displayedVersions: [
                      ...new Set(
                        postgresVersions
                          .filter(product => product.brand === brand)
                          .map(product => product.version)
                      ),
                    ],
                    selectedVersion:
                      findBrand?.version ?? postgresVersions[0].version,
                    displayedColors: postgresVersions
                      .filter(
                        product =>
                          product.version ===
                          (findBrand?.version ?? postgresVersions[0].version)
                      )
                      .map(version => version.color),
                    selectedColor:
                      findBrand?.color ?? postgresVersions[0].color,
                    description:
                      findBrand?.description ?? postgresVersions[0].description,
                    displayedSizes:
                      findBrand?.sizes ?? postgresVersions[0].sizes,
                    selectedSize:
                      findBrand?.sizes[0] ?? postgresVersions[0].sizes[0],
                    price: findBrand?.price ?? postgresVersions[0].price,
                    price_before:
                      findBrand?.price_before ??
                      postgresVersions[0].price_before,
                  }))
                  closeModal()
                  router.push(`${ROUTE_PRODUCT}/${paramsType}`)
                }}
                className={`${
                  brand === versionState.selectedBrand && 'text-red-500'
                } border border-black p-2 hover:cursor-pointer`}
              >
                {brand}
              </Button>
            ))}
          </>
        )
      case 'version':
        return (
          <>
            {versionState.displayedVersions.map(version => (
              <Button
                key={version}
                onClick={() => {
                  setVersionState(prev => {
                    const matchedProduct =
                      postgresVersions.find(
                        product => product.version === version
                      ) ?? postgresVersions[0]
                    return {
                      ...prev,
                      selectedVersion: version,
                      displayedColors: postgresVersions
                        .filter(product => product.version === version)
                        .map(product => product.color),
                      selectedColor: matchedProduct.color,
                      description: matchedProduct.description,
                      displayedSizes: matchedProduct.sizes,
                      selectedSize: matchedProduct.sizes[0],
                      price: matchedProduct.price,
                      price_before: matchedProduct.price_before,
                    }
                  })
                  closeModal()
                  router.push(
                    `${ROUTE_PRODUCT}/${paramsType}?version=${version}`
                  )
                }}
                className={`${
                  version === versionState.selectedVersion && 'text-red-500'
                } border border-black p-2 hover:cursor-pointer`}
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
    return defaultDisplayedImages.map(url => (
      <Carousel.Slide key={url}>
        <Image
          component={NextImage}
          src={url}
          alt={url}
          fill
          // objectFit="contain"
        />
      </Carousel.Slide>
    ))
  }

  const [cart, setCart] = useState<LocalStorageCart>([])
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
        <h1>{versionState.selectedVersion}</h1>
        <h1>{versionState.selectedBrand}</h1>
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
          {versionState.displayedColors.map(color => {
            function handleOnClick() {
              setVersionState(prev => {
                const foundVersion = postgresVersions.find(
                  product => product.color === color
                )
                if (!foundVersion) {
                  redirect(`${ROUTE_ERROR}?error=product-version-not-found`)
                }
                return {
                  ...prev,
                  selectedColor: color,
                  description: foundVersion.description,
                  displayedSizes: foundVersion.sizes,
                  selectedSize: foundVersion.sizes[0],
                  price: foundVersion.price,
                  price_before: foundVersion.price_before,
                }
              })
            }
            return color === versionState.selectedColor ? (
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
        <textarea value={versionState.description} readOnly={true} />
      </div>

      <div className="flex items-center m-2">
        <h1 className="mr-2">Μεγέθοι</h1>
        <div className="flex gap-2">
          {versionState.displayedSizes.map(size =>
            size === versionState.selectedSize ? (
              <div key={size} className="border p-0.5">
                <Button
                  onClick={() => {
                    setVersionState(prev => ({ ...prev, selectedSize: size }))
                  }}
                >
                  {size}
                </Button>
              </div>
            ) : (
              <Button
                key={size}
                onClick={() =>
                  setVersionState(prev => ({ ...prev, selectedSize: size }))
                }
              >
                {size}
              </Button>
            )
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 m-2">
        <h1>Τιμή</h1>
        {versionState.price_before && (
          <span className="text-gray-500 line-through">
            {versionState.price_before}€
          </span>
        )}
        <span className="font-bold">{versionState.price}€</span>
        {versionState.price_before && (
          <span className="text-green-700">
            (Κερδίζεις {versionState.price_before - versionState.price}€)
          </span>
        )}
      </div>

      <div className="flex m-2 items-center">
        <Button onClick={handlers.decrement}>-</Button>
        <h1 className="px-3 py-1 border">{count}</h1>
        <Button onClick={handlers.increment}>+</Button>
      </div>

      <div className="m-2">
        <Button
          onClick={() => {
            setCart(prev => {
              const existingIndex = prev.findIndex(
                item =>
                  item.type === paramsType &&
                  item.version === versionState.selectedVersion &&
                  item.color === versionState.selectedColor &&
                  item.size === versionState.selectedSize
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
                    version: versionState.selectedVersion,
                    color: versionState.selectedColor,
                    image: `${paramsType}/${versionState.selectedVersion}`,
                    size: versionState.selectedSize,
                    price: versionState.price,
                    price_before: versionState.price_before,
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
