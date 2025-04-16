'use client'

import type { typeVariant } from '@/lib/postgres/data/type'

import HeaderProvider from '@/context/HeaderProvider'
import {
  Accordion,
  Button,
  Container,
  Image,
  Pagination,
  SimpleGrid,
} from '@mantine/core'
import NextImage from 'next/image'
import { envClient } from '@/env'
import {
  typeHomePage,
  typeHomePageReviews,
  typeHomePageVariants,
  typeShipping,
} from '@/utils/getPostgres'
import Link from 'next/link'
import { ImQuotesLeft } from 'react-icons/im'
import { Carousel } from '@mantine/carousel'
import { Fragment, useRef, useState } from 'react'
import { ROUTE_COLLECTION, ROUTE_PRODUCT } from '@/data/routes'
import Autoplay from 'embla-carousel-autoplay'
import { IoIosStar } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa'

type HomePageClientProps = {
  home_page: typeHomePage
  home_page_variants: typeHomePageVariants
  home_page_reviews: typeHomePageReviews
  product_types: string[]
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function HomePageClient({
  home_page,
  home_page_variants,
  home_page_reviews,
  product_types,
  all_variants,
  shipping,
}: HomePageClientProps) {
  const autoplay = useRef(Autoplay({ delay: 5000 }))

  const [displayedVariants, setDisplayedVariants] = useState(
    home_page_variants.filter(
      variant => variant.product_type === home_page_variants[0].product_type
    )
  )
  const [visibleReviews, setVisibleReviews] = useState(home_page_reviews)

  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1">
        <div className="relative aspect-square">
          <Image
            component={NextImage}
            src={`${envClient.MINIO_PRODUCT_URL}/home_page/${home_page.big_image}`}
            alt={home_page.big_image}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        {home_page.smaller_images.length > 0 && (
          <div className="pt-[0.625rem] mb-6">
            <SimpleGrid cols={{ base: 2, md: 3, xl: 4 }} spacing="xs">
              {home_page.smaller_images.map(({ image, url }, index) => (
                <Link
                  key={index}
                  href={url}
                  className="border border-[var(--mantine-border)] overflow-hidden"
                >
                  <div className="relative aspect-square">
                    <Image
                      component={NextImage}
                      src={`${envClient.MINIO_PRODUCT_URL}/home_page/${image}`}
                      alt={image}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </Link>
              ))}
            </SimpleGrid>
          </div>
        )}
        {home_page.quotes.length > 0 && (
          <Carousel withIndicators loop plugins={[autoplay.current]}>
            {home_page.quotes.map((quote, index) => (
              <Carousel.Slide key={index}>
                <figure className="justify-items-center">
                  <ImQuotesLeft size={40} />
                  <blockquote>
                    <p className="proxima-nova text-lg my-1">{quote.quote}</p>
                  </blockquote>
                  <figcaption className="text-xl">{quote.author}</figcaption>
                </figure>
              </Carousel.Slide>
            ))}
          </Carousel>
        )}
        {displayedVariants.length > 0 && (
          <div className="flex flex-col mt-6">
            <h1 className="mb-2 text-center text-xl xl:text-2xl">
              Κατηγορίες Προϊόντων
            </h1>
            <hr className="border-t-2 border-[var(--mantine-border)] my-6" />
            <div className="flex gap-2 justify-center">
              {home_page_variants
                .map(variant => variant.product_type)
                .filter(
                  (item, index, self) =>
                    index === self.findIndex(other => other === item)
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
                          variant => variant.product_type === product_type
                        )
                      )
                    }
                  >
                    {product_type}
                  </Button>
                ))}
            </div>
            <div className="p-[0.75rem]">
              <SimpleGrid cols={{ base: 2, md: 3, xl: 4 }} spacing="sm">
                {displayedVariants.map(
                  ({ product_type, name, image }, index) => (
                    <Link
                      key={index}
                      href={`${ROUTE_PRODUCT}/${product_type}/${name}`}
                      className="border border-[var(--mantine-border)] rounded-lg overflow-hidden"
                    >
                      <div className="relative aspect-square rounded-lg">
                        <Image
                          component={NextImage}
                          src={`${envClient.MINIO_PRODUCT_URL}/${product_type}/${image}`}
                          alt={name}
                          fill
                          style={{ objectFit: 'cover' }}
                          priority
                        />
                      </div>
                      <p className="text-center">{name}</p>
                    </Link>
                  )
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
        {home_page.faq.length > 0 && (
          <Container size="xl" className="mt-6">
            <Accordion variant="separated">
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
          <div className="mx-4 my-6 md:w-1/2">
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
                    <IoIosStar key={i} size={18} className="text-yellow-500" />
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
              total={Math.ceil(home_page_reviews.length / 10)}
              onChange={pageNumber =>
                setVisibleReviews(
                  home_page_reviews.slice(
                    (pageNumber - 1) * 10,
                    pageNumber * 10
                  )
                )
              }
              mt="xs"
              style={{ display: 'flex', justifyContent: 'center' }}
            />
          </div>
        )}
      </main>
    </HeaderProvider>
  )
}
