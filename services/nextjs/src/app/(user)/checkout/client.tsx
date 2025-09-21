'use client'

import type {
  typeVariant,
  typeCartLocalStorage,
  typeCoupon,
} from '@/lib/postgres/data/type'
import type { typeOrderByOrderCode, typeShipping } from '@/utils/getPostgres'

import { zodCheckout, zodCoupon } from '@/lib/postgres/data/zod'
import { envClient } from '@/envClient'
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
import { errorAxios, errorInvalidResponse } from '@/data/error'
import { Footer } from '@/components/Footer'
import {
  getLocalStorageCart,
  getLocalStorageCoupon,
  setLocalStorageCoupon,
} from '@/utils/localStorage'
import axios from 'axios'
import Link from 'next/link'
import { facebookPixelPurchase } from '@/lib/facebook-pixel/index'
import { googleAnalyticsPurchase } from '@/lib/google-analytics'
import { couponCodeMPRELOK } from '@/data/magic'
import Script from 'next/script'

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
      window.scrollTo({ top: 0, left: 0 })
      localStorage.removeItem('cart')
      localStorage.removeItem('coupon')
      facebookPixelPurchase(total, cart)
      googleAnalyticsPurchase(orderCompleteResponse.id, total, cart)
    }
  }, [orderCompleteResponse])

  const [saveInfo, setSaveInfo] = useState(true)
  const [cart, setCart] = useState<typeCartLocalStorage>([])

  const form = useForm({
    mode: 'controlled',
    onValuesChange(values) {
      if (saveInfo) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { box_now_locker_id, ...rest } = values
        localStorage.setItem('checkout', JSON.stringify(rest))
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
      delivery_method: 'ΕΛΤΑ Courier',
      box_now_locker_id: null as null | string,
      payment_method: 'Κάρτα',
    },
    validate: zodResolver(zodCheckout),
  })

  useEffect(() => {
    const checkout = localStorage.getItem('checkout')
    if (checkout) {
      form.setValues(JSON.parse(checkout))
    }
    const localStorageCart = getLocalStorageCart()
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
  }, [saveInfo, form.values])

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
    0,
  )
  const cartTotal = coupon?.percentage
    ? baseCartTotal - baseCartTotal * coupon.percentage
    : coupon?.fixed
    ? baseCartTotal - coupon.fixed
    : baseCartTotal

  const freeShipping = shipping.free ? cartTotal >= shipping.free : false
  const shippingExpense = freeShipping
    ? 0
    : form.values.delivery_method === 'ΕΛΤΑ Courier'
    ? shipping.expense_elta_courier ?? 0
    : shipping.expense_box_now ?? 0
  const shippingSurcharge =
    form.values.payment_method === 'Αντικαταβολή'
      ? shipping.surcharge
        ? shipping.surcharge
        : 0
      : 0
  const shippingAndSurchargeTotal = shippingExpense + shippingSurcharge

  const [total, setTotal] = useState(cartTotal + shippingAndSurchargeTotal)

  useEffect(() => {
    if (hasMounted) {
      setLocalStorageCoupon(coupon)
    }
    setTotal(cartTotal + shippingAndSurchargeTotal)
    if (couponCodeRef?.current?.value) {
      couponCodeRef.current.value = ''
    }
  }, [hasMounted, coupon, cartTotal, shippingAndSurchargeTotal])
  const [
    formLoadingOverlay,
    { open: openFormLoadingOverlay, close: closeFormLoadingOverlay },
  ] = useDisclosure(false)

  const pathname = usePathname()
  const prevPath = useRef(pathname)
  const sentRef = useRef(false)
  useEffect(() => {
    if (isAbandonCart || orderCompleteResponse || !form.values.receive_email) {
      return
    }

    const { data: validatedEmail } = z
      .string()
      .email()
      .safeParse(form.values.email)
    if (!validatedEmail) {
      return
    }

    const url = `${envClient.API_USER_URL}/abandon_cart`

    const sendAbandon = () => {
      if (sentRef.current) {
        return
      }

      const payload = JSON.stringify({ email: validatedEmail, cart })

      if (typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' })
        if (navigator.sendBeacon(url, blob)) {
          sentRef.current = true
          return
        }
      }

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      })
        .catch(() => {})
        .finally(() => {
          sentRef.current = true
        })
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendAbandon()
      }
    }

    window.addEventListener('pagehide', sendAbandon)
    document.addEventListener('visibilitychange', onVisibility)

    if (prevPath.current !== pathname) {
      sendAbandon()
    }
    prevPath.current = pathname

    return () => {
      window.removeEventListener('pagehide', sendAbandon)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [
    isAbandonCart,
    pathname,
    cart,
    form.values.email,
    form.values.receive_email,
    orderCompleteResponse,
  ])

  const countryIsGreece = form.values.country === 'Ελλάδα'
  useEffect(() => {
    if (form.values.country === 'Κύπρος') {
      form.setFieldValue('delivery_method', 'ΕΛΤΑ Courier')
      form.setFieldValue('payment_method', 'Κάρτα')
    }
  }, [form.values.country])

  const [boxNowScriptHasLoaded, setBoxNowScriptHasLoaded] = useState(false)
  const [boxNowMapHasRendered, setBoxNowMapHasRendered] = useState(false)
  const boxNowButtonRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    if (!countryIsGreece || !boxNowScriptHasLoaded || boxNowMapHasRendered) {
      return
    }
    requestAnimationFrame(() => boxNowButtonRef.current?.click())
    setBoxNowMapHasRendered(true)
  }, [countryIsGreece, boxNowScriptHasLoaded, boxNowMapHasRendered])
  const isBoxNow = form.values.delivery_method === 'BOX NOW'

  useEffect(() => {
    const onBoxNowLockerSelection = (e: Event) => {
      const { detail } = e as CustomEvent<{
        boxnowLockerPostalCode: string
        boxnowLockerAddressLine1: string
        boxnowLockerId: string
      }>
      const { boxnowLockerId } = detail
      form.setFieldValue('box_now_locker_id', boxnowLockerId)
    }

    window.addEventListener(
      'selected',
      onBoxNowLockerSelection as EventListener,
    )
    return () => {
      window.removeEventListener(
        'selected',
        onBoxNowLockerSelection as EventListener,
      )
    }
  }, [])
  useEffect(() => {
    if (!isBoxNow) {
      form.setFieldValue('box_now_locker_id', null)
    }
  }, [form.values.delivery_method])

  return (
    <div className="min-h-screen flex flex-col">
      {isBoxNow && (
        <>
          <Script id="boxnow-config" strategy="afterInteractive">
            {`
          window._bn_map_widget_config = {
            partnerId: ${envClient.BOX_NOW_PARTNER_ID},
            parentElement: "#boxnowmap",
            afterSelect: function(selected) {
              window.dispatchEvent(
                new CustomEvent("selected", { detail: selected })
              )
            }
          };
        `}
          </Script>
          <Script
            src="https://widget-cdn.boxnow.gr/map-widget/client/v5.js"
            strategy="afterInteractive"
            onLoad={() => setBoxNowScriptHasLoaded(true)}
          />
        </>
      )}

      <header className="relative flex justify-center p-2 border-b border-b-[var(--mantine-border)]">
        <Link
          href={ROUTE_HOME}
          onClick={(e) => {
            if (!orderCompleteResponse) {
              e.preventDefault()
            }
          }}
          className={`flex justify-center ${
            !orderCompleteResponse ? 'cursor-default' : ''
          }`}
        >
          <Image
            component={NextImage}
            src="/motowear.png"
            width={200}
            height={100}
            alt="motowear.gr"
            className="sm:scale-110"
          />
        </Link>
      </header>

      <main className="flex-1 relative p-4">
        {!orderCompleteResponse ? (
          <>
            <LoadingOverlay
              visible={formLoadingOverlay}
              zIndex={50}
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
                                    2,
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
                    {coupon && coupon.coupon_code === couponCodeMPRELOK && (
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
              autoComplete="on"
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
                    },
                  )

                  if (res.status === 209) {
                    const { error, data: validatedResponse } = z
                      .object({ url: z.string() })
                      .safeParse(res.data)

                    if (error) {
                      router.push(
                        `${ROUTE_ERROR}?message=${errorInvalidResponse}`,
                      )
                      return
                    }

                    window.location.assign(validatedResponse.url)
                  } else if (res.status === 200) {
                    const { error, data: validatedResponse } = z
                      .object({
                        id: z.number(),
                        first_name: z.string(),
                        email: z.string().email(),
                      })
                      .safeParse(res.data)

                    if (error) {
                      router.push(
                        `${ROUTE_ERROR}?message=${errorInvalidResponse}`,
                      )

                      return
                    }

                    setOrderCompleteResponse(validatedResponse)
                  }
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    console.error({
                      code: err?.code,
                      message: err.message,
                      status: err?.response?.status,
                      url: err?.config?.url,
                      request: err?.response?.request,
                    })
                  } else {
                    console.error(err)
                  }

                  router.push(`${ROUTE_ERROR}?message=${errorAxios}`)
                } finally {
                  closeFormLoadingOverlay()
                }
              })}
            >
              <div className="lg:w-1/2 lg:mr-8">
                <div>
                  <h1 className="text-xl">Στοιχεία επικοινωνίας</h1>
                  <TextInput
                    key={form.key('email')}
                    label="Email"
                    autoComplete="email"
                    {...form.getInputProps('email')}
                    styles={{ input: { fontSize: 16 } }}
                  />
                  <Checkbox
                    key={form.key('receive_email')}
                    label="Θέλω να λαμβάνω email με ειδήσεις και προσφορές"
                    mt="xs"
                    size="xs"
                    {...form.getInputProps('receive_email', {
                      type: 'checkbox',
                    })}
                  />
                </div>

                <div>
                  <h1 className="text-xl mt-4">Παράδοση</h1>
                  <div className="flex flex-col gap-3">
                    <Select
                      key={form.key('country')}
                      label="Χώρα"
                      data={['Ελλάδα', 'Κύπρος']}
                      defaultValue={'Ελλάδα'}
                      allowDeselect={false}
                      {...form.getInputProps('country')}
                      styles={{ input: { fontSize: 16 } }}
                    />
                    <TextInput
                      key={form.key('first_name')}
                      label="Όνομα"
                      autoComplete="given-name"
                      {...form.getInputProps('first_name')}
                      styles={{ input: { fontSize: 16 } }}
                    />
                    <TextInput
                      key={form.key('last_name')}
                      label="Επίθετο"
                      autoComplete="family-name"
                      {...form.getInputProps('last_name')}
                      styles={{ input: { fontSize: 16 } }}
                    />
                    <TextInput
                      key={form.key('address')}
                      label="Διεύθυνση"
                      autoComplete="street-address"
                      {...form.getInputProps('address')}
                      styles={{ input: { fontSize: 16 } }}
                    />
                    <TextInput
                      key={form.key('extra')}
                      label="Διαμέρισμα, σουίτα κ.λπ. (προαιρετικά)"
                      autoComplete="address-line2"
                      {...form.getInputProps('extra')}
                      styles={{ input: { fontSize: 16 } }}
                    />
                    <TextInput
                      key={form.key('post_code')}
                      label="Ταχυδρομικός κώδικας"
                      autoComplete="postal-code"
                      {...form.getInputProps('post_code')}
                      styles={{ input: { fontSize: 16 } }}
                    />
                    <TextInput
                      key={form.key('city')}
                      label="Πόλη"
                      autoComplete="address-level2"
                      {...form.getInputProps('city')}
                      styles={{ input: { fontSize: 16 } }}
                    />
                    <NumberInput
                      key={form.key('phone')}
                      label="Τηλέφωνο"
                      type="tel"
                      autoComplete="tel"
                      hideControls
                      {...form.getInputProps('phone')}
                      onChange={(value) => {
                        form.setFieldValue('phone', String(value))
                      }}
                      styles={{ input: { fontSize: 16 } }}
                    />
                  </div>
                  <Checkbox
                    key={form.key('receive_phone')}
                    mt="xs"
                    size="xs"
                    label="Θέλω να λαμβάνω μηνύματα με ειδήσεις και προσφορές"
                    {...form.getInputProps('receive_phone', {
                      type: 'checkbox',
                    })}
                  />
                  <Checkbox
                    label="Αποθήκευση αυτών των πληροφοριών για την επόμενη φορά"
                    mt="xs"
                    size="xs"
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
                                    2,
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
                        {coupon && coupon.coupon_code === couponCodeMPRELOK && (
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

                <h1 className="text-xl mt-4 lg:mt-0">Τρόπος Παράδοσης</h1>
                <Radio.Group
                  name="delivery_method"
                  value={form.values.delivery_method}
                  onChange={(value) =>
                    form.setFieldValue('delivery_method', value)
                  }
                  error={form.errors.box_now_locker_id}
                  className={`p-2 border ${
                    form.errors.box_now_locker_id
                      ? 'border-red-500'
                      : 'border-[var(--mantine-border)]'
                  }  rounded-lg`}
                >
                  <Group gap="xs">
                    <Radio
                      size="sm"
                      value="ΕΛΤΑ Courier"
                      styles={{ body: { alignItems: 'center' } }}
                      label={
                        <span>
                          {`ΕΛΤΑ Courier ${
                            shipping.expense_elta_courier
                              ? `(${shipping.expense_elta_courier}€ έξοδα αποστολής)`
                              : ''
                          }`}
                          <br />
                          <span className="proxima-nova">
                            Παράδοση στο σπίτι σου
                          </span>
                        </span>
                      }
                    />
                    {countryIsGreece && (
                      <>
                        <hr className="w-full border-[var(--mantine-border)]" />
                        <Radio
                          size="sm"
                          value="BOX NOW"
                          styles={{ body: { alignItems: 'center' } }}
                          label={
                            <span>
                              {`BOX NOW ${
                                shipping.expense_box_now
                                  ? `(${shipping.expense_box_now}€ έξοδα αποστολής)`
                                  : ''
                              }`}
                              <br />
                              <span className="proxima-nova">
                                Παραλαβή από locker
                              </span>
                            </span>
                          }
                        />
                      </>
                    )}
                  </Group>
                  <button
                    ref={boxNowButtonRef}
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="boxnow-map-widget-button hidden"
                  />
                  <div
                    id="boxnowmap"
                    className={`${isBoxNow ? 'h-[750px]' : 'hidden'}`}
                  />
                </Radio.Group>

                <h1 className="text-xl mt-4">Τρόπος Πληρωμής</h1>
                <Radio.Group
                  name="payment_method"
                  value={form.values.payment_method}
                  onChange={(value) =>
                    form.setFieldValue('payment_method', value)
                  }
                  className="p-2 border border-[var(--mantine-border)] rounded-lg"
                >
                  <Group gap="xs">
                    <Radio
                      size="sm"
                      value="Κάρτα"
                      styles={{ body: { alignItems: 'center' } }}
                      label={
                        <div>
                          <Image
                            component={NextImage}
                            src="/viva.png"
                            alt="viva wallet payment"
                            width={1341}
                            height={156}
                            className="max-w-[750px]"
                          />
                          <h3 className="mt-1">
                            Τραπεζική Κάρτα, Iris, Apple Pay ... (Viva.com)
                          </h3>
                        </div>
                      }
                    />
                    {countryIsGreece && (
                      <>
                        <hr className="w-full border-[var(--mantine-border)]" />
                        <Radio
                          size="sm"
                          value="Αντικαταβολή"
                          styles={{ body: { alignItems: 'center' } }}
                          label={
                            <span>
                              {form.values.delivery_method === 'ΕΛΤΑ Courier'
                                ? 'Αντικαταβολή'
                                : 'Πληρωμή online κατά την παραλαβή'}
                              <br />
                              <span className="proxima-nova">
                                {form.values.delivery_method === 'ΕΛΤΑ Courier'
                                  ? 'Δεν συνιστάται'
                                  : '* Όχι μετρητά'}
                                {`${
                                  shipping.surcharge
                                    ? ` (+${shipping.surcharge}€ επιβάρυνση)`
                                    : ''
                                }`}
                              </span>
                            </span>
                          }
                        />
                      </>
                    )}
                  </Group>
                </Radio.Group>

                <Box className="relative">
                  <LoadingOverlay
                    visible={couponLoadingOverlay}
                    zIndex={50}
                    overlayProps={{ radius: 'xs', blur: 1 }}
                  />
                  <div className="flex gap-2 items-end mb-2">
                    <TextInput
                      label="Κωδικός έκπτωσης"
                      ref={couponCodeRef}
                      className="flex-1 mt-2"
                      styles={{ input: { fontSize: 16 } }}
                    />
                    <Button
                      type="button"
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

                            if (res.status === 200) {
                              const { error, data: validatedResponse } = z
                                .object({ couponArray: z.array(zodCoupon) })
                                .safeParse(res?.data)

                              if (error) {
                                router.push(
                                  `${ROUTE_ERROR}?message=${errorInvalidResponse}`,
                                )

                                return
                              }

                              if (validatedResponse.couponArray.length === 1) {
                                setCoupon(validatedResponse.couponArray[0])
                              } else {
                                setCoupon(null)
                              }
                            }
                          } catch (err) {
                            if (axios.isAxiosError(err)) {
                              console.error({
                                code: err?.code,
                                message: err.message,
                                status: err?.response?.status,
                                url: err?.config?.url,
                                request: err?.response?.request,
                              })
                            } else {
                              console.error(err)
                            }

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
                          {(baseCartTotal * 0.76).toFixed(2)}€
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
                          {(baseCartTotal * 0.24).toFixed(2)}€
                        </p>
                      )}
                      <p>{(cartTotal * 0.24).toFixed(2)}€</p>
                    </div>
                  </div>
                  <div className="flex">
                    <h2>Έξοδα αποστολής</h2>
                    {!freeShipping ? (
                      <p className="ml-auto">{shippingExpense.toFixed(2)}€</p>
                    ) : (
                      <div className="ml-auto flex gap-2 items-center">
                        <p className="text-[var(--mantine-border)] line-through decoration-red-500">
                          {(form.values.delivery_method === 'ΕΛΤΑ Courier'
                            ? shipping.expense_elta_courier ?? 0
                            : shipping.expense_box_now ?? 0
                          ).toFixed(2)}
                          €
                        </p>
                        <p>0.00€</p>
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
              από εμάς, και έπειτα θα σας ενημερώσει η κούριερ όταν το δέμα σας
              φτάσει στον προορισμό.
            </p>
            <p className="text-center">
              Για οποιαδήποτε ερώτηση/διευκρίνηση επικοινωνήστε μαζί μας στο{' '}
              <Link
                href="mailto:contact@motowear.gr"
                className="text-red-600 hover:underline"
              >
                contact@motowear.gr
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
