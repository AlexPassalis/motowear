import type { typeCartLocalStorage, typeCoupon } from '@/lib/postgres/data/type'
import { typeShipping } from '@/utils/getPostgres'

import { envClient } from '@/env'
import {
  Box,
  Button,
  Card,
  Image,
  LoadingOverlay,
  Progress,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import NextImage from 'next/image'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { FaTrashCan } from 'react-icons/fa6'
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa'
import Link from 'next/link'
import { ROUTE_CHECKOUT, ROUTE_ERROR, ROUTE_PRODUCT } from '@/data/routes'
import { useDisclosure } from '@mantine/hooks'
import axios from 'axios'
import { errorAxios, errorInvalidResponse, errorUnexpected } from '@/data/error'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { zodCoupon } from '@/lib/postgres/data/zod'
import { MdDiscount } from 'react-icons/md'
import { facebookPixelInitiateCheckout } from '@/lib/facebook-pixel'
import { couponCodeMPRELOK } from '@/data/magic'

type CartProps = {
  isCartOpen: boolean
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
  shipping: typeShipping
  cart: typeCartLocalStorage
  setCart: Dispatch<SetStateAction<typeCartLocalStorage>>
  coupon: null | typeCoupon
  setCoupon: Dispatch<SetStateAction<null | typeCoupon>>
}

export function Cart({
  cart,
  setCart,
  shipping,
  isCartOpen,
  setIsCartOpen,
  coupon,
  setCoupon,
}: CartProps) {
  const router = useRouter()
  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  )
  const [total, setTotal] = useState(cartTotal)
  const couponCodeRef = useRef<null | HTMLInputElement>(null)
  useEffect(() => {
    if (coupon) {
      setTotal(
        coupon?.percentage
          ? cartTotal - cartTotal * coupon.percentage
          : coupon?.fixed
          ? cartTotal - coupon.fixed
          : cartTotal,
      )
    } else {
      setTotal(cartTotal)
    }
  }, [cart, coupon])
  const [
    couponLoadingOverlay,
    { open: openCouponLoadingOverlay, close: closeCouponLoadingOverlay },
  ] = useDisclosure(false)

  return (
    <section
      className={`fixed top-0 right-0 w-full max-w-[400px] h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ zIndex: 100 }}
    >
      <div className="flex flex-col h-full p-4 min-h-0">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 mb-2 border-[var(--mantine-border)]">
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl">
            Καλάθι ({cart.length})
          </h1>
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="flex ml-auto justify-center items-center h-10 w-10 rounded-md border border-[var(--mantine-border)] transition-colors hover:cursor-pointer group"
          >
            <AiOutlineClose className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
        </div>
        {cart.length < 1 ? (
          <>
            <h1 className="text-center text-xl">Το καλάθι σου είναι άδειο.</h1>
            {coupon && coupon.coupon_code === couponCodeMPRELOK && (
              <div className="mt-auto">
                <div className="flex w-full h-36 mb-2 rounded-lg border border-[var(--mantine-border)]">
                  <Link
                    href={`${ROUTE_PRODUCT}/Μπρελόκ/Πιστόνι`}
                    className="relative w-1/3 h-full rounded-lg overflow-hidden"
                  >
                    <Image
                      component={NextImage}
                      src={`${envClient.MINIO_PRODUCT_URL}/Μπρελόκ/Πιστόνι.jpg`}
                      alt="Πιστόνι"
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="auto"
                    />
                  </Link>
                  <div className="w-2/3 flex flex-col gap-0.5 p-2">
                    <h1>Μπρελόκ</h1>
                    <h1>Πιστόνι</h1>
                    <div className="flex gap-2 items-center">
                      <h2 className="text-[var(--mantine-border)] line-through decoration-red-500">
                        7.99€
                      </h2>
                      <h2>0.00€</h2>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 p-2 border border-[var(--mantine-border)] rounded-lg">
                  <div className="flex items-center">
                    <p className="mr-1 proxima-nova">{coupon.coupon_code}</p>
                    <MdDiscount />
                  </div>
                  <span>Δώρο Μπρελόκ</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {shipping.free && (
              <Card
                withBorder
                radius="md"
                padding="md"
                mb="xs"
                bg="var(--mantine-color-body)"
              >
                <h1 className="text-center">Δωρεάν Μεταφορικά Έξοδα</h1>
                <div className="text-center">
                  <span
                    className={`${
                      Math.min((total / shipping.free) * 100, 100) < 100
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {total.toFixed(2)}€
                  </span>{' '}
                  <span>/ {shipping.free.toFixed(2)}€</span>
                </div>
                <Progress
                  value={Math.min((total / shipping.free) * 100, 100)}
                  color={`${total < shipping.free ? 'red' : 'green'}`}
                  size="lg"
                  radius="xl"
                  mt="xs"
                />
              </Card>
            )}

            <div className="flex-1 overflow-y-auto">
              {cart.map((product, index) => (
                <div
                  key={index}
                  className="flex w-full h-36 mb-2 rounded-lg border border-[var(--mantine-border)]"
                >
                  <Link
                    href={`${ROUTE_PRODUCT}/${product.product_type}/${product.name}`}
                    className="relative w-1/3 h-full rounded-lg overflow-hidden"
                  >
                    <Image
                      component={NextImage}
                      src={`${envClient.MINIO_PRODUCT_URL}/${product.product_type}/${product.image}`}
                      alt={`${product.product_type}/${product.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="auto"
                    />
                  </Link>
                  <div className="relative w-2/3 flex flex-col justify-center gap-0.5 p-2">
                    <FaTrashCan
                      onClick={() =>
                        setCart((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-2 right-2 hover:cursor-pointer"
                    />
                    <h1>{product.product_type}</h1>
                    <h1 className="flex-1 flex items-center break-words overflow-hidden">
                      {product.name}
                    </h1>
                    {product?.color && (
                      <div className="flex gap-1">
                        <h2>Χρώμα: </h2>
                        <div
                          style={{ backgroundColor: product.color }}
                          className="w-6 h-6 rounded-full"
                        />
                      </div>
                    )}
                    {product?.size && (
                      <div className="flex gap-1">
                        <h2>
                          {`${
                            product.product_type !== 'Θήκη Κινητού'
                              ? 'Μέγεθος'
                              : 'Συσκευή'
                          }:`}{' '}
                        </h2>
                        <p>{product.size}</p>
                      </div>
                    )}
                    {product?.price_before ? (
                      <>
                        <div className="flex gap-2 items-center">
                          <h2 className="text-[var(--mantine-border)] line-through decoration-red-500">
                            {(product.price_before * product.quantity).toFixed(
                              2,
                            )}
                            €
                          </h2>
                          <h2>
                            {(product.price * product.quantity).toFixed(2)}€
                          </h2>
                        </div>
                      </>
                    ) : (
                      <h2>{(product.price * product.quantity).toFixed(2)}€</h2>
                    )}

                    <div className="absolute bottom-2 right-2 flex w-16 h-[28px] rounded-lg border-2 border-[var(--mantine-border)]">
                      <div
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((item, i) =>
                              i === index && item.quantity > 1
                                ? { ...item, quantity: item.quantity - 1 }
                                : item,
                            ),
                          )
                        }
                        className="w-1/3"
                      >
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
                          <FaMinus size={10} />
                        </UnstyledButton>
                      </div>
                      <div className="flex w-1/3 items-center justify-center border-x-1 border-[var(--mantine-border)]">
                        <p>{product.quantity}</p>
                      </div>
                      <div
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, quantity: item.quantity + 1 }
                                : item,
                            ),
                          )
                        }
                        className="w-1/3"
                      >
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
                          <FaPlus size={10} />
                        </UnstyledButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {cart.length > 0 && (
          <Box className="mt-auto relative">
            <LoadingOverlay
              visible={couponLoadingOverlay}
              zIndex={150}
              overlayProps={{ radius: 'xs', blur: 1 }}
            />

            {coupon && coupon.coupon_code === couponCodeMPRELOK && (
              <div className="flex w-full h-36 mb-2 rounded-lg border border-[var(--mantine-border)]">
                <Link
                  href={`${ROUTE_PRODUCT}/Μπρελόκ/Πιστόνι`}
                  className="relative w-1/3 h-full rounded-lg overflow-hidden"
                >
                  <Image
                    component={NextImage}
                    src={`${envClient.MINIO_PRODUCT_URL}/Μπρελόκ/Πιστόνι.jpg`}
                    alt="Πιστόνι"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="auto"
                  />
                </Link>
                <div className="w-2/3 flex flex-col gap-0.5 p-2">
                  <h1>Μπρελόκ</h1>
                  <h1>Πιστόνι</h1>
                  <div className="flex gap-2 items-center">
                    <h2 className="text-[var(--mantine-border)] line-through decoration-red-500">
                      7.99€
                    </h2>
                    <h2>0.00€</h2>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <TextInput
                label="Κωδικός έκπτωσης"
                ref={couponCodeRef}
                className="flex-1"
                styles={{ input: { fontSize: 16 } }}
              />
              <Button
                onClick={async () => {
                  if (couponCodeRef.current) {
                    try {
                      openCouponLoadingOverlay()
                      const res = await axios.post(
                        `${envClient.API_USER_URL}/coupon_code`,
                        {
                          coupon_code: couponCodeRef.current.value,
                        },
                      )
                      if (res.status !== 200) {
                        router.push(
                          `${ROUTE_ERROR}?message=${
                            res?.data?.message || errorUnexpected
                          }`,
                        )
                      }

                      const { data: validatedResponse } = z
                        .object({ couponArray: z.array(zodCoupon) })
                        .safeParse(res?.data)
                      if (!validatedResponse) {
                        router.push(
                          `${ROUTE_ERROR}?message=${errorInvalidResponse}-coupon_code`,
                        )
                      }
                      if (couponCodeRef?.current?.value) {
                        couponCodeRef.current.value = ''
                      }
                      if (validatedResponse!.couponArray.length === 1) {
                        setCoupon(validatedResponse!.couponArray[0])
                      } else {
                        setCoupon(null)
                      }
                    } catch {
                      router.push(`${ROUTE_ERROR}?message=${errorAxios}`)
                    } finally {
                      closeCouponLoadingOverlay()
                    }
                  }
                }}
                className="ml-auto flex-shrink-0"
              >
                Εφαρμογή
              </Button>
            </div>

            {coupon && (
              <div className="flex justify-between items-center mt-2 p-2 border border-[var(--mantine-border)] rounded-lg">
                <div className="flex items-center">
                  <p className="mr-1 proxima-nova">{coupon.coupon_code}</p>
                  <MdDiscount />
                </div>
                <span className="text-[var(--mantine-border)] line-through decoration-red-500">
                  {coupon?.percentage
                    ? `${(total * coupon.percentage).toFixed(2)}€`
                    : coupon?.fixed
                    ? `${coupon.fixed.toFixed(2)}€`
                    : ''}
                </span>
                <span>
                  {coupon?.percentage
                    ? `${coupon.percentage * 100}% έκπτωση`
                    : coupon?.fixed
                    ? `${coupon.fixed.toFixed(2)}€ έκπτωση`
                    : 'Δώρο Μπρελόκ'}
                </span>
              </div>
            )}

            <Link href={ROUTE_CHECKOUT}>
              <Button
                color="red"
                size="lg"
                mt="md"
                style={{ width: '100%' }}
                onClick={() => facebookPixelInitiateCheckout(total, cart)}
              >
                Ταμείο {total.toFixed(2)}€
              </Button>
            </Link>
          </Box>
        )}
      </div>
    </section>
  )
}
