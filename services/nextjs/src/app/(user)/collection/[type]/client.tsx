'use client'

import type { typeVariant } from '@/lib/postgres/data/type'
import type { typeShipping } from '@/utils/getPostgres'

import HeaderProvider from '@/context/HeaderProvider'
import { envClient } from '@/envClient'
import { SimpleGrid, Pagination, UnstyledButton, Modal } from '@mantine/core'
import Image from 'next/image'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IoIosArrowDown } from 'react-icons/io'
import { Cart } from '@/app/(user)/collection/[type]/Cart'
import { useDisclosure } from '@mantine/hooks'
import { specialBrand, specialVariant } from '@/data/magic'

type CollectionPageClientProps = {
  paramsProduct_type: string
  product_types: string[]
  all_variants: typeVariant[]
  shipping: typeShipping
  uniqueVariants: {
    name: string
    color: string
    brand: string
    image: string
  }[]
  uniqueBrands: string[]
}

export function CollectionPageClient({
  paramsProduct_type,
  product_types,
  all_variants,
  shipping,
  uniqueVariants,
  uniqueBrands,
}: CollectionPageClientProps) {
  const [brandDropdown, setBrandDropdown] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState('')
  useEffect(() => {
    setPageNumber(1)
  }, [selectedBrand])

  const [modal, { open: openModal, close: closeModal }] = useDisclosure(false)
  useEffect(() => {
    if (uniqueBrands.length > 1) {
      openModal()
    }
  }, [])

  const [pageNumber, setPageNumber] = useState(1)

  const filtered = useMemo<typeof uniqueVariants>(() => {
    const unique = selectedBrand
      ? uniqueVariants.filter((v) => v.brand === selectedBrand)
      : uniqueVariants

    const specialVariants = uniqueVariants.filter((v) =>
      specialVariant.includes(v.name),
    )

    if (specialVariants.length === 0 || selectedBrand === specialBrand) {
      return unique
    } else {
      return [
        ...specialVariants,
        ...unique.filter((v) => !specialVariant.includes(v.name)),
        ...specialVariants,
      ]
    }
  }, [selectedBrand])

  const paginated = useMemo(() => {
    return filtered.slice((pageNumber - 1) * 20, pageNumber * 20)
  }, [filtered, pageNumber])

  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set())
  useEffect(() => {
    const newLoadingSet = new Set<number>()
    for (let i = 0; i < paginated.length; i++) {
      newLoadingSet.add(i)
    }
    setLoadingImages(newLoadingSet)
  }, [paginated])

  const onImageLoad = useCallback(
    (index: number) =>
      setLoadingImages((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      }),
    [setLoadingImages],
  )

  return (
    <>
      <Modal
        opened={modal}
        onClose={() => closeModal()}
        title="Επίλεξε μάρκα"
        styles={{
          header: {
            display: 'flex',
            justifyContent: 'center',
          },
          title: { fontSize: '1.25rem' },
        }}
        withCloseButton={false}
        centered
      >
        <div
          className="flex flex-col gap-1 p-1 border rounded-lg bg-white max-h-96 overflow-y-auto"
          style={{ zIndex: 75 }}
        >
          {uniqueBrands
            .filter((brand) => brand !== selectedBrand)
            .map((brand, index, array) => (
              <Fragment key={index}>
                <div
                  onClick={() => {
                    setSelectedBrand(brand)
                    closeModal()
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
        </div>
      </Modal>

      <div
        onClick={() => {
          if (brandDropdown) {
            setBrandDropdown(false)
          }
        }}
      >
        <HeaderProvider
          product_types={product_types}
          all_variants={all_variants}
          shipping={shipping}
        >
          <main className="flex-1 flex flex-col">
            <h1 className="text-2xl text-center">{paramsProduct_type}</h1>
            {uniqueBrands.length > 0 && (
              <div className="ml-2 flex flex-col">
                <h2 className="text-lg xl:text-xl">Μάρκα</h2>
                <div className="relative max-w-[408px]">
                  <div
                    onClick={() => setBrandDropdown((prev) => !prev)}
                    className={`flex items-center pb-0.5 border-2 border-white ${
                      brandDropdown
                        ? 'border-b-white'
                        : 'border-b-[var(--mantine-border)]'
                    } hover:border-2 hover:rounded-lg hover:border-red-500`}
                  >
                    {selectedBrand === '' ? (
                      <UnstyledButton
                        style={{
                          height: '48px',
                          width: '100%',
                          marginLeft: '8px',
                          cursor: 'pointer',
                        }}
                        className="proxima-nova"
                        classNames={{
                          root: '!xl:text-gl',
                        }}
                      >
                        Επίλεξε
                      </UnstyledButton>
                    ) : (
                      <div className="relative w-full max-w-96 h-12">
                        <Image
                          src={`${envClient.MINIO_PRODUCT_URL}/brands/${selectedBrand}`}
                          alt={selectedBrand}
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
                        className="absolute left-0 top-full mt-0.5 w-full max-w-[408px] bg-white flex flex-col gap-1 max-h-96 overflow-y-auto p-1 border rounded-lg"
                        style={{ zIndex: 75 }}
                      >
                        {selectedBrand !== '' && (
                          <>
                            <div
                              onClick={() => setSelectedBrand('')}
                              className="p-1 border border-white rounded-lg hover:border-red-500"
                            >
                              <UnstyledButton
                                style={{
                                  width: '100%',
                                  height: '48px',
                                }}
                                className="proxima-nova"
                                classNames={{
                                  root: '!xl:text-lg',
                                }}
                              >
                                Καμία μάρκα
                              </UnstyledButton>
                            </div>
                            {uniqueBrands.length !== 1 && (
                              <hr className="w-full border-t-2 border-[var(--mantine-border)]" />
                            )}
                          </>
                        )}
                        {uniqueBrands
                          .filter((brand) => brand !== selectedBrand)
                          .map((brand, index, array) => (
                            <Fragment key={index}>
                              <div
                                onClick={() => setSelectedBrand(brand)}
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
              </div>
            )}

            <div className="p-4">
              <SimpleGrid cols={{ base: 2, md: 3, xl: 4 }} spacing="sm" mb="md">
                {paginated.map(({ name, color, image }, index) => {
                  return (
                    <Cart
                      key={`${selectedBrand}-${index}`}
                      paramsProduct_type={paramsProduct_type}
                      isLoading={loadingImages.has(index)}
                      index={index}
                      name={name}
                      color={color}
                      image={image}
                      onImageLoad={onImageLoad}
                    />
                  )
                })}
              </SimpleGrid>
              <Pagination
                total={Math.ceil(filtered.length / 20)}
                value={pageNumber}
                onChange={setPageNumber}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 'auto',
                }}
              />
            </div>
          </main>
        </HeaderProvider>
      </div>
    </>
  )
}
