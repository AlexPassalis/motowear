'use client'

import classes from '@/css/Demo.module.css'

import HeaderProvider from '@/context/HeaderProvider'
import {
  Accordion,
  Button,
  Container,
  LoadingOverlay,
  Pagination,
  SimpleGrid,
} from '@mantine/core'
import Image from 'next/image'
import { envClient } from '@/envClient'
import {
  typeHomePage,
  typeHomePageVariants,
  typeShipping,
} from '@/utils/getPostgres'
import Link from 'next/link'
import { ImQuotesLeft } from 'react-icons/im'
import { Carousel } from '@mantine/carousel'
import { Fragment, useEffect, useRef, useState } from 'react'
import { ROUTE_COLLECTION, ROUTE_PRODUCT } from '@/data/routes'
import Autoplay from 'embla-carousel-autoplay'
import { IoIosStar } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa'

type HomePageClientProps = {
  home_page: typeHomePage
  home_page_variants: typeHomePageVariants
  product_types: string[]
  shipping: typeShipping
}

export function HomePageClient({
  home_page,
  home_page_variants,
  product_types,
  shipping,
}: HomePageClientProps) {
  const autoplay = useRef(Autoplay({ delay: 5000 }))

  const [displayedVariants, setDisplayedVariants] = useState(
    home_page_variants.filter(
      (variant) => variant.product_type === home_page_variants[0].product_type,
    ),
  )

  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set())
  useEffect(() => {
    const newLoadingSet = new Set<number>()
    for (let i = 0; i < displayedVariants.length; i++) {
      newLoadingSet.add(i)
    }
    setLoadingImages(newLoadingSet)
  }, [displayedVariants])

  const reviewsPageSize = 5
  const [visibleReviews, setVisibleReviews] = useState(
    home_page.reviews.slice(0, reviewsPageSize),
  )

  return (
    <HeaderProvider product_types={product_types} shipping={shipping}>
      <main className="flex-1">
        <Link
          href={home_page.big_image.url}
          onClick={(e) => {
            if (!home_page.big_image.url) {
              e.preventDefault()
            }
          }}
          className={`${!home_page.big_image.url ? 'cursor-default' : ''}`}
        >
          <div className="relative aspect-[1/1.4] md:aspect-[2/1]">
            <Image
              src={`${envClient.MINIO_PRODUCT_URL}/home_page/${home_page.big_image.phone}`}
              alt={home_page.big_image.phone}
              fill
              style={{ objectFit: 'cover' }}
              priority
              fetchPriority="high"
              quality={100}
              className="md:hidden"
            />
            <Image
              src={`${envClient.MINIO_PRODUCT_URL}/home_page/${home_page.big_image.laptop}`}
              alt={home_page.big_image.laptop}
              fill
              style={{ objectFit: 'cover' }}
              priority
              fetchPriority="high"
              quality={100}
              className="hidden md:block"
            />
          </div>
        </Link>
        {home_page.smaller_images.length > 0 && (
          <div className="pt-[0.625rem] mb-10">
            <SimpleGrid cols={{ base: 2, md: 3, xl: 4 }} spacing="xs">
              {home_page.smaller_images.map(({ image, url }, index) => (
                <Link
                  key={index}
                  href={url}
                  onClick={(e) => {
                    if (!url) {
                      e.preventDefault()
                    }
                  }}
                  className={`border border-[var(--mantine-border)] overflow-hidden ${
                    !url ? 'cursor-default' : ''
                  }`}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={`${envClient.MINIO_PRODUCT_URL}/home_page/${image}`}
                      alt={image}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      fetchPriority="high"
                    />
                  </div>
                </Link>
              ))}
            </SimpleGrid>
          </div>
        )}
        {home_page.quotes.length > 0 && (
          <div className="px-[0.75rem] max-w-[1000px] mx-auto">
            <Carousel classNames={classes} loop plugins={[autoplay.current]}>
              {home_page.quotes.map((quote, index) => (
                <Carousel.Slide key={index}>
                  <figure className="flex flex-col items-center justify-center gap-2">
                    <ImQuotesLeft size={40} />
                    <blockquote>
                      <p className="proxima-nova text-lg text-center">
                        {quote.quote}
                      </p>
                    </blockquote>
                    <figcaption className="text-xl">{quote.author}</figcaption>
                  </figure>
                </Carousel.Slide>
              ))}
            </Carousel>
          </div>
        )}
        {displayedVariants.length > 0 && (
          <div className="flex flex-col mt-10">
            <div className="px-[0.75rem]">
              <h1 className="text-center text-xl xl:text-2xl">
                Κατηγορίες Προϊόντων
              </h1>
              <hr className="my-2 border-t-2 border-[var(--mantine-border)] max-w-[500px] mx-auto" />
              <div className="flex flex-wrap gap-2 justify-center">
                {home_page_variants
                  .map((variant) => variant.product_type)
                  .filter(
                    (item, index, self) =>
                      index === self.findIndex((other) => other === item),
                  )
                  .map((product_type, index) => (
                    <Button
                      key={index}
                      variant={`${
                        displayedVariants[0].product_type === product_type
                          ? 'filled'
                          : 'outline'
                      }`}
                      onClick={() =>
                        setDisplayedVariants(
                          home_page_variants.filter(
                            (variant) => variant.product_type === product_type,
                          ),
                        )
                      }
                    >
                      {product_type}
                    </Button>
                  ))}
              </div>
            </div>
            <div className="p-[0.75rem]">
              <SimpleGrid cols={{ base: 2, md: 3, xl: 4 }} spacing="sm">
                {displayedVariants.map(
                  ({ product_type, name, image }, index) => (
                    <Link
                      key={`${product_type}-${name}`}
                      href={`${ROUTE_PRODUCT}/${product_type}/${name}`}
                      className="border border-[var(--mantine-border)] rounded-lg overflow-hidden"
                    >
                      <div className="relative aspect-square rounded-lg">
                        <LoadingOverlay
                          visible={loadingImages.has(index)}
                          zIndex={50}
                          overlayProps={{ radius: 'sm', blur: 2 }}
                        />
                        <Image
                          key={`${product_type}-${name}-${image}-${index}`}
                          src={`${envClient.MINIO_PRODUCT_URL}/${product_type}/${image}`}
                          alt={name}
                          fill
                          style={{ objectFit: 'cover' }}
                          onLoad={() =>
                            setLoadingImages((prev) => {
                              const next = new Set(prev)
                              next.delete(index)
                              return next
                            })
                          }
                        />
                      </div>
                      <p className="text-center">{name}</p>
                    </Link>
                  ),
                )}
              </SimpleGrid>
            </div>
            <Link
              href={`${ROUTE_COLLECTION}/${displayedVariants[0].product_type}`}
              className="mx-auto"
            >
              <Button>Προβολή όλων</Button>
            </Link>
          </div>
        )}
        <div className="flex flex-col xl:flex-row">
          {home_page.faq.length > 0 && (
            <Container size="xl" className="mt-10 w-full xl:w-1/2" fluid>
              <h1 className="mb-2 text-center text-xl xl:text-2xl">FAQ</h1>
              <Accordion
                variant="separated"
                classNames={{
                  root: 'max-w-full',
                }}
              >
                {home_page.faq.map((faq, index) => (
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
          {visibleReviews.length > 0 && (
            <div className="mx-4 my-10 xl:w-1/2">
              <h1 className="mb-2 text-center text-xl xl:text-2xl">
                Αξιολογήσεις
              </h1>
              {visibleReviews.map((review, index) => (
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
                total={Math.ceil(home_page.reviews.length / reviewsPageSize)}
                onChange={(pageNumber) =>
                  setVisibleReviews(
                    home_page.reviews.slice(
                      (pageNumber - 1) * reviewsPageSize,
                      pageNumber * reviewsPageSize,
                    ),
                  )
                }
                mt="xs"
                style={{ display: 'flex', justifyContent: 'center' }}
              />
            </div>
          )}
        </div>
      </main>
    </HeaderProvider>
  )
}
