'use client'

import type {
  typeVariant,
  typeCartLocalStorage,
  typeCoupon,
} from '@/lib/postgres/data/type'
import type { typeOrderByOrderCode, typeShipping } from '@/utils/getPostgres'

import { zodCheckout, zodCoupon } from '@/lib/postgres/data/zod'
import { envClient } from '@/env'
import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Button,
  Checkbox,
  Group,
  Image,
  NumberInput,
  Select,
  TextInput,
  Radio,
  LoadingOverlay,
  Box,
  Accordion,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { MdDiscount } from 'react-icons/md'
import { ROUTE_ERROR, ROUTE_HOME } from '@/data/routes'
import { errorAxios, errorUnexpected, errorInvalidResponse } from '@/data/error'
import { Footer } from '@/components/Footer'
import {
  getFilteredLocalStorageCart,
  getLocalStorageCoupon,
  setLocalStorageCoupon,
} from '@/utils/localStorage'
import axios from 'axios'
import Link from 'next/link'

type CheckoutPageProps = {
  isAbandonCart: boolean
  orderDetails:
    | undefined
    | {
        first_name: typeOrderByOrderCode['checkout']['first_name']
        id: typeOrderByOrderCode['id']
        email: typeOrderByOrderCode['checkout']['email']
      }
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function CheckoutPageClient({
  isAbandonCart,
  orderDetails,
  all_variants,
  shipping,
}: CheckoutPageProps) {
  const router = useRouter()
  const [orderCompleteResponse, setOrderCompleteResponse] = useState<null | {
    first_name: string
    id: number
    email: string
  }>(orderDetails ? orderDetails : null)
  useEffect(() => {
    if (orderCompleteResponse) {
      localStorage.removeItem('cart')
      localStorage.removeItem('coupon')
    }
  }, [orderCompleteResponse])

  const [saveInfo, setSaveInfo] = useState(true)
  const [cart, setCart] = useState<typeCartLocalStorage>([])

  const form = useForm({
    mode: 'controlled',
    onValuesChange(values) {
      if (saveInfo) {
        localStorage.setItem('checkout', JSON.stringify(values))
      }
    },
    initialValues: {
      email: '',
      receive_email: true,
      country: 'Ελλάδα',
      first_name: '',
      last_name: '',
      address: '',
      extra: '',
      post_code: '',
      city: '',
      phone: '',
      receive_phone: true,
      payment_method: 'Κάρτα',
    },
    validate: zodResolver(zodCheckout),
  })

  useEffect(() => {
    const checkout = localStorage.getItem('checkout')
    if (checkout) {
      form.setValues(JSON.parse(checkout))
    }
    const localStorageCart = getFilteredLocalStorageCart(all_variants)
    if (!orderCompleteResponse && localStorageCart.length < 1) {
      router.push(ROUTE_HOME)
    }
    setCart(localStorageCart)
  }, [all_variants])

  useEffect(() => {
    if (saveInfo) {
      localStorage.setItem('checkout', JSON.stringify(form.getValues()))
    }
    if (!saveInfo) {
      localStorage.removeItem('checkout')
    }
  }, [saveInfo, form])

  const couponCodeRef = useRef<null | HTMLInputElement>(null)
  const [
    couponLoadingOverlay,
    { open: openCouponLoadingOverlay, close: closeCouponLoadingOverlay },
  ] = useDisclosure(false)
  const [coupon, setCoupon] = useState<null | typeCoupon>(null)
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setCoupon(getLocalStorageCoupon())
    setHasMounted(true)
  }, [])
  const baseCartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )
  const cartTotal = coupon?.percentage
    ? baseCartTotal - baseCartTotal * coupon.percentage
    : coupon?.fixed
    ? baseCartTotal - coupon.fixed
    : baseCartTotal

  const freeShipping = shipping.free ? cartTotal >= shipping.free : false
  const shippingSurchargeTotal =
    (freeShipping ? 0 : shipping.expense ?? 0) +
    (form.getValues().payment_method !== 'Αντικαταβολή'
      ? 0
      : shipping.surcharge ?? 0)

  const [total, setTotal] = useState(cartTotal + shippingSurchargeTotal)

  useEffect(() => {
    if (hasMounted) {
      setLocalStorageCoupon(coupon)
    }
    setTotal(cartTotal + shippingSurchargeTotal)
    if (couponCodeRef?.current?.value) {
      couponCodeRef.current.value = ''
    }
  }, [hasMounted, coupon, cartTotal, shippingSurchargeTotal])
  const [
    formLoadingOverlay,
    { open: openFormLoadingOverlay, close: closeFormLoadingOverlay },
  ] = useDisclosure(false)

  const pathname = usePathname()
  const prevPath = useRef(pathname)
  useEffect(() => {
    if (isAbandonCart || orderCompleteResponse || !form.values.receive_email) {
      return
    }

    const parsed = z.string().email().safeParse(form.values.email)
    if (!parsed.success) return

    const sendAbandon = () => {
      void axios
        .post(`${envClient.API_USER_URL}/abandon_cart`, {
          email: parsed.data,
          cart,
        })
        .catch(() => {})
    }
    window.addEventListener('beforeunload', sendAbandon)
    if (prevPath.current !== pathname) {
      sendAbandon()
    }
    prevPath.current = pathname

    return () => {
      window.removeEventListener('beforeunload', sendAbandon)
    }
  }, [
    isAbandonCart,
    pathname,
    cart,
    form.values.email,
    form.values.receive_email,
    orderCompleteResponse,
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative flex justify-center p-2 border-b border-b-[var(--mantine-border)]">
        <Image
          component={NextImage}
          src="/motowear.png"
          width={200}
          height={100}
          alt="Motowear logo"
          className="sm:scale-110"
        />
      </header>

      <main className="flex-1 relative p-4">
        {!orderCompleteResponse ? (
          <>
            <LoadingOverlay
              visible={formLoadingOverlay}
              zIndex={1000}
              overlayProps={{ radius: 'xs', blur: 1 }}
            />

            <div className="lg:hidden">
              <Accordion variant="separated">
                <Accordion.Item
                  value="value"
                  bg="white"
                  style={{ border: 'none' }}
                >
                  <Accordion.Control
                    style={{ textAlign: 'center', fontSize: '1rem' }}
                  >
                    Σύνοψη παραγγελίας
                  </Accordion.Control>
                  <Accordion.Panel>
                    {cart.map((product, index) => (
                      <div
                        key={index}
                        className="flex w-full h-36 mb-2 rounded-lg border border-[var(--mantine-border)]"
                      >
                        <div className="relative w-1/3 h-full rounded-lg overflow-hidden">
                          <Image
                            component={NextImage}
                            src={`${envClient.MINIO_PRODUCT_URL}/${product.product_type}/${product.image}`}
                            alt={`${product.product_type}/${product.name}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="auto"
                          />
                        </div>
                        <div className="relative w-2/3 flex flex-col justify-center gap-0.5 p-2">
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
                                  {(
                                    product.price_before * product.quantity
                                  ).toFixed(2)}
                                  €
                                </h2>
                                <h2>
                                  {(product.price * product.quantity).toFixed(
                                    2
                                  )}
                                  €
                                </h2>
                              </div>
                            </>
                          ) : (
                            <h2>
                              {(product.price * product.quantity).toFixed(2)}€
                            </h2>
                          )}
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            <h2>Ποσότητα: </h2>
                            <p>{product.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {coupon && coupon.coupon_code === 'FREE-MPRELOK' && (
                      <div className="flex w-full h-36 mb-2 rounded-lg border border-[var(--mantine-border)]">
                        <div className="relative w-1/3 h-full rounded-lg overflow-hidden">
                          <Image
                            component={NextImage}
                            src={`${envClient.MINIO_PRODUCT_URL}/Μπρελόκ/Πιστόνι.jpg`}
                            alt="Πιστόνι"
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="auto"
                          />
                        </div>
                        <div className="relative w-2/3 flex flex-col gap-0.5 p-2">
                          <h1>Μπρελόκ</h1>
                          <h1>Πιστόνι</h1>
                          <div className="flex gap-2 items-center">
                            <h2 className="text-[var(--mantine-border)] line-through decoration-red-500">
                              7.99€
                            </h2>
                            <h2>0.00€</h2>
                          </div>
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            <h2>Ποσότητα: </h2>
                            <p>1</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </div>
            <form
              className="flex flex-col lg:flex-row lg:w-1/2 lg:mx-auto"
              onSubmit={form.onSubmit(async (values) => {
                openFormLoadingOverlay()
                try {
                  const res = await axios.post(
                    `${envClient.API_USER_URL}/checkout`,
                    {
                      checkout: values,
                      cart: cart,
                      coupon: coupon,
                    }
                  )
                  if (res.status === 209) {
                    const { error: err, data: validatedResponse } = z
                      .object({ url: z.string() })
                      .safeParse(res.data)
                    if (err) {
                      router.push(
                        `${ROUTE_ERROR}?message=${errorInvalidResponse}`
                      )
                      return
                    }
                    window.location.assign(validatedResponse.url)
                  } else {
                    const { error: err, data: validatedResponse } = z
                      .object({
                        id: z.number(),
                        first_name: z.string(),
                        email: z.string().email(),
                      })
                      .safeParse(res.data)
                    if (err) {
                      router.push(
                        `${ROUTE_ERROR}?message=${errorInvalidResponse}`
                      )
                      return
                    }
                    setOrderCompleteResponse(validatedResponse)
                  }
                } catch (err) {
                  localStorage.removeItem('cart')
                  localStorage.removeItem('coupon')
                  let message: string = errorUnexpected
                  if (axios.isAxiosError(err)) {
                    if (err.response?.data?.message) {
                      message = err.response.data.message
                    } else if (err.message) {
                      message = err.message
                    }
                  }
                  router.push(`${ROUTE_ERROR}?message=${message}`)
                } finally {
                  closeFormLoadingOverlay()
                }
              })}
            >
              <div className="lg:w-1/2 lg:mr-8">
                <div>
                  <h1 className="text-xl">Στοιχεία επικοινωνίας</h1>
                  <TextInput
                    label="Email"
                    {...form.getInputProps('email')}
                    key={form.key('email')}
                  />
                  <Checkbox
                    mt="xs"
                    size="sm"
                    label="Θέλω να λαμβάνω email με ειδήσεις και προσφορές"
                    key={form.key('receive_email')}
                    {...form.getInputProps('receive_email', {
                      type: 'checkbox',
                    })}
                  />
                </div>

                <div>
                  <h1 className="text-xl mt-4">Παράδωση</h1>
                  <div className="flex flex-col gap-2">
                    <Select
                      label="Χώρα"
                      defaultValue={'Ελλάδα'}
                      data={['Ελλάδα', 'Κύπρος']}
                      allowDeselect={false}
                    />
                    <TextInput
                      label="Όνομα"
                      key={form.key('first_name')}
                      {...form.getInputProps('first_name')}
                    />
                    <TextInput
                      label="Επίθετο"
                      key={form.key('last_name')}
                      {...form.getInputProps('last_name')}
                    />
                    <TextInput
                      label="Διεύθηνση"
                      key={form.key('address')}
                      {...form.getInputProps('address')}
                    />
                    <TextInput
                      label="Διαμέρισμα, σουίτα κ.λπ. (προαιρετικά)"
                      key={form.key('extra')}
                      {...form.getInputProps('extra')}
                    />
                    <TextInput
                      label="Ταχυδρομικός κώδικας"
                      key={form.key('post_code')}
                      {...form.getInputProps('post_code')}
                    />
                    <TextInput
                      label="Πόλη"
                      key={form.key('city')}
                      {...form.getInputProps('city')}
                    />
                    <NumberInput
                      label="Τηλέφωνο"
                      hideControls
                      key={form.key('phone')}
                      {...form.getInputProps('phone')}
                      onChange={(value) => {
                        form.setFieldValue('phone', String(value))
                      }}
                    />
                  </div>
                  <Checkbox
                    mt="xs"
                    size="sm"
                    label="Θέλω να λαμβάνω μηνύματα με ειδήσεις και προσφορές"
                    key={form.key('receive_phone')}
                    {...form.getInputProps('receive_phone', {
                      type: 'checkbox',
                    })}
                  />
                  <Checkbox
                    mt="xs"
                    size="sm"
                    label="Αποθήκευση αυτών των πληροφοριών για την επόμενη φορά"
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                  />
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className="hidden lg:block">
                  <Accordion variant="separated">
                    <Accordion.Item
                      value="value"
                      bg="white"
                      style={{ border: 'none' }}
                    >
                      <Accordion.Control
                        style={{ textAlign: 'center', fontSize: '1rem' }}
                      >
                        Σύνοψη παραγγελίας
                      </Accordion.Control>
                      <Accordion.Panel>
                        {cart.map((product, index) => (
                          <div
                            key={index}
                            className="flex w-full h-36 mb-2 rounded-lg border border-[var(--mantine-border)]"
                          >
                            <div className="relative w-1/3 h-full rounded-lg overflow-hidden">
                              <Image
                                component={NextImage}
                                src={`${envClient.MINIO_PRODUCT_URL}/${product.product_type}/${product.image}`}
                                alt={`${product.product_type}/${product.name}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="auto"
                              />
                            </div>
                            <div className="relative w-2/3 flex flex-col justify-center gap-0.5 p-2">
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
                                      {(
                                        product.price_before * product.quantity
                                      ).toFixed(2)}
                                      €
                                    </h2>
                                    <h2>
                                      {(
                                        product.price * product.quantity
                                      ).toFixed(2)}
                                      €
                                    </h2>
                                  </div>
                                </>
                              ) : (
                                <h2>
                                  {(product.price * product.quantity).toFixed(
                                    2
                                  )}
                                  €
                                </h2>
                              )}
                              <div className="absolute bottom-2 right-2 flex gap-1">
                                <h2>Ποσότητα: </h2>
                                <p>{product.quantity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {coupon && coupon.coupon_code === 'FREE-MPRELOK' && (
                          <div className="flex w-full h-36 mb-2 rounded-lg border border-[var(--mantine-border)]">
                            <div className="relative w-1/3 h-full rounded-lg overflow-hidden">
                              <Image
                                component={NextImage}
                                src={`${envClient.MINIO_PRODUCT_URL}/Μπρελόκ/Πιστόνι.jpg`}
                                alt="Πιστόνι"
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="auto"
                              />
                            </div>
                            <div className="relative w-2/3 flex flex-col gap-0.5 p-2">
                              <h1>Μπρελόκ</h1>
                              <h1>Πιστόνι</h1>
                              <div className="flex gap-2 items-center">
                                <h2 className="text-[var(--mantine-border)] line-through decoration-red-500">
                                  7.99€
                                </h2>
                                <h2>0.00€</h2>
                              </div>
                              <div className="absolute bottom-2 right-2 flex gap-1">
                                <h2>Ποσότητα: </h2>
                                <p>1</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </div>
                <h1 className="text-xl mt-4 lg:mt-0">Τρόπος Πληρωμής</h1>
                <Radio.Group
                  name="payment_method"
                  value={form.values.payment_method}
                  onChange={(value) =>
                    form.setFieldValue('payment_method', value)
                  }
                  error={form.errors.payment_method}
                  className="p-2 border border-[var(--mantine-border)] rounded-lg"
                >
                  <Group gap="sm">
                    <Radio
                      size="sm"
                      value="Κάρτα"
                      label="Πληρωμή με Κάρτα ή IRIS Payments (Viva Wallet)"
                    />
                    <hr className="w-full border-t-2 border-[var(--mantine-border)]" />
                    <Radio
                      size="sm"
                      value="Αντικαταβολή"
                      label={`Αντικαταβολή${
                        shipping.surcharge
                          ? ` +${shipping.surcharge}€ επιβάρυνση`
                          : ''
                      }`}
                    />
                  </Group>
                </Radio.Group>

                <Box className="relative">
                  <LoadingOverlay
                    visible={couponLoadingOverlay}
                    zIndex={1000}
                    overlayProps={{ radius: 'xs', blur: 1 }}
                  />
                  <div className="flex gap-2 items-end mb-2">
                    <TextInput
                      label="Κωδικός έκπτωσης"
                      ref={couponCodeRef}
                      className="flex-1 mt-2"
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
                              }
                            )
                            if (res.status !== 200) {
                              router.push(
                                `${ROUTE_ERROR}?message=${
                                  res?.data?.message || errorUnexpected
                                }`
                              )
                            }

                            const { data: validatedResponse } = z
                              .object({ couponArray: z.array(zodCoupon) })
                              .safeParse(res?.data)
                            if (!validatedResponse) {
                              router.push(
                                `${ROUTE_ERROR}?message=${errorInvalidResponse}-coupon_code`
                              )
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
                    <div className="flex justify-between items-center my-1 p-2 border border-[var(--mantine-border)] rounded-lg">
                      <div className="flex items-center">
                        <p className="mr-1 proxima-nova">
                          {coupon.coupon_code}
                        </p>
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
                  <div className="flex">
                    <h2>Υποσύνολο</h2>
                    <div className="ml-auto flex gap-2 items-center">
                      {coupon && (
                        <p className="text-[var(--mantine-border)] line-through decoration-red-500">
                          {(cartTotal * 0.76).toFixed(2)}€
                        </p>
                      )}
                      <p>{(cartTotal * 0.76).toFixed(2)}€</p>
                    </div>
                  </div>
                  <div className="flex">
                    <h2>ΦΠΑ</h2>
                    <div className="ml-auto flex gap-2 items-center">
                      {coupon && (
                        <p className="text-[var(--mantine-border)] line-through decoration-red-500">
                          {(cartTotal * 0.24).toFixed(2)}€
                        </p>
                      )}
                      <p>{(cartTotal * 0.24).toFixed(2)}€</p>
                    </div>
                  </div>
                  <div className="flex">
                    <h2>Έξοδα αποστολής</h2>
                    {!freeShipping ? (
                      <p className="ml-auto">
                        {shipping.expense
                          ? shipping.expense.toFixed(2)
                          : '0.00'}
                        €
                      </p>
                    ) : (
                      <div className="ml-auto flex gap-2 items-center">
                        <p className="text-[var(--mantine-border)] line-through decoration-red-500">
                          {shipping.expense
                            ? shipping.expense.toFixed(2)
                            : '0.00'}
                          €
                        </p>
                        {shipping.expense && <p>0.00€</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex">
                    <h2>Επιβάρυνση</h2>
                    <p className="ml-auto">
                      {(form.values.payment_method === 'Αντικαταβολή' &&
                      shipping.surcharge
                        ? shipping.surcharge
                        : 0
                      ).toFixed(2)}
                      €
                    </p>
                  </div>
                  <div className="flex">
                    <h2>Σύνολο</h2>
                    <p className="ml-auto">{total.toFixed(2)}€</p>
                  </div>
                  <Button
                    type="submit"
                    disabled={cart.length < 1}
                    mt="xl"
                    color="red"
                    size="md"
                    radius="md"
                    style={{ width: '100%' }}
                  >
                    {form.values.payment_method === 'Κάρτα'
                      ? 'Πληρωμή'
                      : 'Ολοκλήρωση Παραγγελίας'}
                  </Button>
                </Box>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col h-full justify-center items-center">
            <p className="mb-8 text-lg">{`Σας ευχαριστούμε ${orderCompleteResponse.first_name}!`}</p>
            <p>Η παραγγελία σας με αριθμό :</p>
            <span className="text-red-500">{orderCompleteResponse.id}</span>
            <p className=" mb-8">ήταν επιτυχής.</p>
            <p className="text-center">
              Θα ενημερώνεστε για την εξέλιξη της παραγγελίας σας μέσω email στο
              :
            </p>
            <span className="mb-8 underline">
              {orderCompleteResponse.email}
            </span>
            <p className="mb-8 text-center">
              Κάνουμε το καλύτερο δυνατό για να ετοιμάσουμε και να στείλουμε την
              παραγγελία σου όσο πιο γρήγορα γίνεται.
            </p>
            <p className="mb-8 text-center">
              Θα λάβετε ενημέρωση με τον αριθμό tracking της κούριερ μόλις φύγει
              από εμάς, και έπειτα θα σας ενημερώσει η Κούριερ όταν το δέμα σας
              φτάσει στον προορισμό.
            </p>
            <p className="text-center">
              Για οποιαδήποτε ερώτηση/διευκρίνηση επικοινωνήστε μαζί μας στο{' '}
              <Link
                href="mailto:motoweargr@gmail.com"
                className="text-red-600 hover:underline"
              >
                motoweargr@gmail.com
              </Link>{' '}
              ή τηλεφωνικώς στο{' '}
              <Link
                href="tel:+306939133385"
                className="text-red-600 hover:underline"
              >
                6939133385
              </Link>
              .
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
