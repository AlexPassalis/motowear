'use client'

import type { typeVariant } from '@/lib/postgres/data/type'

import HeaderProvider from '@/context/HeaderProvider'
import { ROUTE_PRODUCT } from '@/data/routes'
import { envClient } from '@/env'
import { SimpleGrid, Image, Pagination, UnstyledButton } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IoIosArrowDown } from 'react-icons/io'

type CollectionPageClientProps = {
  paramsProduct_type: string
  product_types: string[]
  all_variants: typeVariant[]
  uniqueVariants: { image: string; name: string; brand: string }[]
  uniqueBrands: string[]
}

export function CollectionPageClient({
  paramsProduct_type,
  product_types,
  all_variants,
  uniqueVariants,
  uniqueBrands,
}: CollectionPageClientProps) {
  const [visibleVariants, setVisibleVariants] = useState(uniqueVariants)
  const [brandDropdown, setBrandDropdown] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState('')

  useEffect(() => {
    if (selectedBrand) {
      setVisibleVariants(
        uniqueVariants.filter(variant => variant.brand === selectedBrand)
      )
    } else {
      setVisibleVariants(uniqueVariants)
    }
  }, [selectedBrand])

  return (
    <div
      onClick={() => {
        if (brandDropdown) setBrandDropdown(false)
      }}
    >
      <HeaderProvider product_types={product_types} all_variants={all_variants}>
        <main className="flex-1 flex flex-col">
          <h1 className="text-2xl text-center">{paramsProduct_type}</h1>
          {uniqueBrands.length > 0 && (
            <div className="flex flex-col">
              <h2 className="ml-2 text-xl xl:text-2xl">Μάρκα</h2>
              <div className="relative max-w-[250px]">
                <div
                  onClick={() => setBrandDropdown(prev => !prev)}
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
                        root: '!text-lg xl:!text-xl',
                      }}
                    >
                      διάλεξε
                    </UnstyledButton>
                  ) : (
                    <div className="relative w-full max-w-96 h-12">
                      <Image
                        component={NextImage}
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
                      className="absolute left-0 top-full z-10 mt-0.5 w-full max-w-[250px] bg-white flex flex-col gap-1 max-h-96 overflow-y-auto p-1 border rounded-lg"
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
                                root: '!text-lg xl:!text-xl',
                              }}
                            >
                              καμία μάρκα
                            </UnstyledButton>
                          </div>
                          {uniqueBrands.length !== 1 && (
                            <hr className="w-full border-t-2 border-[var(--mantine-border)]" />
                          )}
                        </>
                      )}
                      {uniqueBrands
                        .filter(brand => brand !== selectedBrand)
                        .map((brand, index, array) => (
                          <Fragment key={index}>
                            <div
                              onClick={() => setSelectedBrand(brand)}
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
            </div>
          )}

          <div className="p-4">
            <SimpleGrid cols={2} spacing="sm" mb="md">
              {visibleVariants.map(({ name, image }, index) => (
                <Link
                  key={index}
                  href={`${ROUTE_PRODUCT}/${paramsProduct_type}/${name}`}
                  className="border border-[var(--mantine-border)] rounded-lg overflow-hidden"
                >
                  <div className="relative aspect-square rounded-lg">
                    <Image
                      component={NextImage}
                      src={`${envClient.MINIO_PRODUCT_URL}/${paramsProduct_type}/${image}`}
                      alt={name}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </div>
                  <p className="text-center">{name}</p>
                </Link>
              ))}
            </SimpleGrid>
            <Pagination
              total={Math.ceil(visibleVariants.length / 20)}
              onChange={pageNumber =>
                setVisibleVariants(
                  uniqueVariants.slice((pageNumber - 1) * 20, pageNumber * 20)
                )
              }
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
  )
}
