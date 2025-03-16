'use client'

import { ProductRow } from '@/data/types'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { AiOutlineLeftCircle, AiOutlineRightCircle } from 'react-icons/ai'
import { useDisclosure } from '@mantine/hooks'
import { Modal, Button } from '@mantine/core'
import { ROUTE_PRODUCT } from '@/data/routes'

type ProductPageClientProps = {
  paramsType: string
  searchParamsVersion: undefined | string
  postgresVersions: ProductRow[]
  displayedBrands: string[]
  uniqueVersions: string[]
}

export function ProductPageClient({
  paramsType,
  searchParamsVersion,
  postgresVersions,
  displayedBrands,
  uniqueVersions,
}: ProductPageClientProps) {
  const router = useRouter()

  const [displayedVersions, setDisplayedVersions] = useState(uniqueVersions)
  const [selectedVersion, setSelectedVersion] = useState(
    searchParamsVersion ?? postgresVersions[0].version
  )

  const [selectedBrand, setSelectedBrand] = useState('-')

  const defaultColorVersions = postgresVersions
    .filter(product => product.version === searchParamsVersion)
    .map(product => product.color)
  const colorVersions = postgresVersions
    .filter(product => product.version === postgresVersions[0].version)
    .map(product => product.color)
  const [displayedColors, setDisplayedColors] = useState(
    searchParamsVersion
      ? defaultColorVersions.length !== 0
        ? defaultColorVersions
        : colorVersions
      : colorVersions
  )
  const [selectedColor, setSelectedColor] = useState(
    searchParamsVersion
      ? postgresVersions.find(
          product => product.version === searchParamsVersion
        )?.color ?? postgresVersions[0].color
      : postgresVersions[0].color
  )

  const defaultSizesVersions = postgresVersions.find(
    product => product.version === searchParamsVersion
  )?.sizes
  const sizesVersions = postgresVersions[0].sizes
  const [displayedSizes, setDisplayedSizes] = useState(
    searchParamsVersion ? defaultSizesVersions ?? sizesVersions : sizesVersions
  )
  const [selectedSize, setSelectedSize] = useState(
    searchParamsVersion
      ? defaultSizesVersions
        ? defaultSizesVersions[0]
        : sizesVersions[0]
      : sizesVersions[0]
  )

  const [openedModal, { open: openModal, close: closeModal }] =
    useDisclosure(false)
  const [modalVersion, setModalVersion] = useState<
    '-' | 'version' | 'brand' | 'color' | 'size'
  >('-')
  function renderModalContent() {
    switch (modalVersion) {
      case 'brand':
        return (
          <>
            <Button
              onClick={() => {
                setSelectedBrand('-')
                setDisplayedVersions(uniqueVersions)
                closeModal()
              }}
              className="border border-black p-2 hover:cursor-pointer"
            >
              -
            </Button>
            {displayedBrands.map(brand => (
              <Button
                key={brand}
                onClick={() => {
                  setSelectedBrand(brand)
                  setDisplayedVersions(
                    postgresVersions
                      .filter(product => product.brand === brand)
                      .map(product => product.version)
                  )
                  setSelectedVersion(
                    postgresVersions.find(product => product.brand === brand)
                      ?.version ?? postgresVersions[0].version
                  )
                  closeModal()
                  router.push(`${ROUTE_PRODUCT}/${paramsType}`)
                }}
                className={`${
                  brand === selectedBrand && 'text-red-500'
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
            {displayedVersions.map(version => (
              <Button
                key={version}
                onClick={() => {
                  setSelectedVersion(version)
                  closeModal()
                  router.push(
                    `${ROUTE_PRODUCT}/${paramsType}?version=${version}`
                  )
                }}
                className={`${
                  version === selectedVersion && 'text-red-500'
                } border border-black p-2 hover:cursor-pointer`}
              >
                {version}
              </Button>
            ))}
          </>
        )
      case 'color':
        return <h1>Color</h1>
      case 'size':
        return <h1>Size</h1>
      default:
        return <p>unknown modal version</p>
    }
  }

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

      <div className="flex flex-col">
        <div className="relative w-full h-[400px]">
          <Image
            src={`http://minio:9000/product/${paramsType}/${selectedVersion}/${
              postgresVersions.find(
                product => product.version === selectedVersion
              )?.images[0]
            }`}
            alt={selectedVersion}
            quality={100}
            fill
            sizes="100vw"
            className="w-full h-aut object-cover"
            priority
          />
          <button
            onClick={() => {}}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group z-10"
          >
            <AiOutlineLeftCircle className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
          <button
            onClick={() => {}}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group z-10"
          >
            <AiOutlineRightCircle className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
        </div>
      </div>
      <div className="flex justify-between m-2">
        <h1>{selectedVersion}</h1>
        <h1>{selectedBrand}</h1>
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
          {displayedColors.map(color => (
            <div
              key={color}
              className={`bg-${color} w-8 h-8 rounded-full hover:cursor-pointer`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center m-2">
        <h1 className="mr-2">Μεγέθοι</h1>
        <div className="flex gap-2">
          {displayedSizes.map(size => (
            <Button key={size}>{size}</Button>
          ))}
        </div>
      </div>
    </>
  )
}
