'use client'

import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
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
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { envClient } from '@/env'
import {
  Variants,
  typeCoupon,
  typeCheckout,
  LocalStorageCartItem,
} from '@/data/type'
import { ROUTE_ERROR } from '@/data/routes'
import { errorAxios, errorUnexpected, errroInvalidResponse } from '@/data/error'
import { Footer } from '@/components/Footer'
import {
  getFilteredLocalStorageCart,
  getLocalStorageCart,
} from '@/utils/localStorage'
import axios from 'axios'

type CheckoutPageProps = {
  all_variants: Variants
}

export function CheckoutPageClient({ all_variants }: CheckoutPageProps) {
  const router = useRouter()
  const [saveInfo, setSaveInfo] = useState(true)
  const [cart, setCart] = useState<LocalStorageCartItem[]>([])
  const couponCodeRef = useRef<null | HTMLInputElement>(null)
  const [visible, { open, close }] = useDisclosure(false)
  const [coupon, setCoupon] = useState<{
    coupon_code?: string
    percentage?: null | number
    fixed?: null | number
  }>({})
  const [total, setTotal] = useState(0)

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
    validate: zodResolver(typeCheckout),
  })

  useEffect(() => {
    const checkout = localStorage.getItem('checkout')
    if (checkout) {
      form.setValues(JSON.parse(checkout))
    }
    setCart(getFilteredLocalStorageCart(all_variants))
    setTotal(
      getLocalStorageCart().reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      )
    )
  }, [all_variants])

  useEffect(() => {
    if (saveInfo) {
      localStorage.setItem('checkout', JSON.stringify(form.getValues()))
    }
    if (!saveInfo) {
      localStorage.removeItem('checkout')
    }
  }, [saveInfo])

  return (
    <>
      <header className="flex justify-center p-2 border-b border-b-gray-200">
        <Image
          component={NextImage}
          src="/motowear.png"
          width={200}
          height={100}
          alt="Motowear logo"
          className="sm:scale-110"
        />
      </header>
      <main className="p-4">
        <form
          className="flex flex-col gap-8"
          onSubmit={form.onSubmit(async values => {
            try {
              const res = await axios.post(`${envClient.API_URL}/checkout`, {
                checkout: values,
                cart: cart,
                coupon: coupon,
              })
              if (res.status !== 200) {
                router.push(
                  `${ROUTE_ERROR}/message?=${
                    res?.data?.message || errorUnexpected
                  }`
                )
              }
              console.log(res)
            } catch {
              router.push(`${ROUTE_ERROR}/message?=${errorAxios}`)
            }
          })}
        >
          <div>
            <h1 className="text-xl">Στοιχεία επικοινωνίας</h1>
            <TextInput
              label="Email"
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            <Checkbox
              mt="xs"
              size="sm"
              label="Θέλω να λαμβάνω email με ειδήσεις και προσφορές"
              key={form.key('receive_email')}
              {...form.getInputProps('receive_email', { type: 'checkbox' })}
            />
          </div>

          <div>
            <h1 className="text-xl">Παράδωση</h1>
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
              />
            </div>
            <Checkbox
              mt="xs"
              size="sm"
              label="Θέλω να λαμβάνω μηνύματα με ειδήσεις και προσφορές"
              key={form.key('receive_phone')}
              {...form.getInputProps('receive_phone', { type: 'checkbox' })}
            />
            <Checkbox
              mt="xs"
              size="sm"
              label="Αποθήκευση αυτών των πληροφοριών για την επόμενη φορά"
              type="checkbox"
              checked={saveInfo}
              onChange={e => setSaveInfo(e.target.checked)}
            />
          </div>

          <div>
            <h1 className="text-xl">Τρόπος Πληρωμής</h1>
            <Radio.Group
              name="payment_method"
              value={form.values.payment_method}
              onChange={value => form.setFieldValue('payment_method', value)}
              error={form.errors.payment_method}
              className="p-2 border border-gray-200 rounded-lg"
            >
              <Group gap="sm">
                <Radio size="sm" value="Κάρτα" label="Τραπεζική Κάρτα" />
                <hr className="w-full border-t border-gray-200" />
                <Radio
                  size="sm"
                  value="Αντικαταβολή"
                  label="Αντικαταβολή (+3€ επιβάρυνση)"
                />
              </Group>
            </Radio.Group>
          </div>

          <div>
            <h1 className="text-xl">Σύνοψη παραγγελίας</h1>
            {cart.map((product, index) => (
              <div
                key={index}
                className="flex w-full h-36 p-1 mb-2 rounded-lg border border-gray-200"
              >
                <div className="relative w-1/3 h-full">
                  <Image
                    component={NextImage}
                    src={`${envClient.MINIO_PRODUCT_URL}/${product.procuct_type}/${product.image}`}
                    alt={`${product.procuct_type}/${product.variant}`}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="auto"
                  />
                </div>
                <div className="relative w-2/3 flex flex-col justify-center gap-0.5 p-1 pl-4">
                  <h1>{product.procuct_type}</h1>
                  <h1>{product.variant}</h1>
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
                      <h2>Μέγεθος: </h2>
                      <p>{product.size}</p>
                    </div>
                  )}
                  {product?.price_before ? (
                    <>
                      <div className="flex gap-2 items-center">
                        <h2 className="text-sm text-gray-400 line-through decoration-red-500">
                          {product.price_before * product.quantity}€
                        </h2>
                        <h2>{product.price * product.quantity}€</h2>
                      </div>
                    </>
                  ) : (
                    <h2>{product.price * product.quantity}€</h2>
                  )}
                </div>
              </div>
            ))}
            <Box className="relative">
              <LoadingOverlay
                visible={visible}
                zIndex={1000}
                overlayProps={{ radius: 'sm', blur: 2 }}
              />
              <div className="flex gap-2 items-end mb-2">
                <LoadingOverlay
                  visible={visible}
                  zIndex={1000}
                  overlayProps={{ radius: 'sm', blur: 2 }}
                />
                <TextInput
                  label="Κωδικός έκπτωσης"
                  ref={couponCodeRef}
                  className="flex-1"
                />
                <Button
                  onClick={async () => {
                    if (couponCodeRef.current) {
                      try {
                        open()
                        const res = await axios.post(
                          `${envClient.API_URL}/coupon_code`,
                          {
                            coupon_code: couponCodeRef.current.value,
                          }
                        )
                        if (res.status !== 200) {
                          router.push(
                            `${ROUTE_ERROR}/message?=${
                              res?.data?.message || errorUnexpected
                            }`
                          )
                        }
                        const { data: validatedCoupon } = z
                          .array(typeCoupon)
                          .safeParse(res?.data?.coupon)
                        if (!validatedCoupon) {
                          router.push(
                            `${ROUTE_ERROR}?message=${errroInvalidResponse}-coupon_code`
                          )
                        }
                        if (validatedCoupon!.length === 1) {
                          setCoupon(validatedCoupon![0])
                        } else {
                          setCoupon({})
                        }
                      } catch {
                        router.push(`${ROUTE_ERROR}/message?=${errorAxios}`)
                      } finally {
                        close()
                      }
                    }
                  }}
                  className="ml-auto flex-shrink-0"
                >
                  Εφαρμογή
                </Button>
              </div>
              <div className="flex">
                <h2>Υποσύνολο</h2>
                <div className="ml-auto flex gap-2 items-center">
                  {Object.keys(coupon).length === 3 && (
                    <p className="text-sm text-gray-400 line-through decoration-red-500">
                      {total * 0.76}€
                    </p>
                  )}
                  <p>
                    {coupon?.percentage
                      ? (total - total * coupon.percentage) * 0.76
                      : coupon?.fixed
                      ? (total - coupon.fixed) * 0.76
                      : total * 0.76}
                    €
                  </p>
                </div>
              </div>
              <div className="flex">
                <h2>ΦΠΑ</h2>
                <div className="ml-auto flex gap-2 items-center">
                  {Object.keys(coupon).length === 3 && (
                    <p className="text-sm text-gray-400 line-through decoration-red-500">
                      {total * 0.24}€
                    </p>
                  )}
                  <p>
                    {coupon?.percentage
                      ? (total - total * coupon.percentage) * 0.24
                      : coupon?.fixed
                      ? (total - coupon.fixed) * 0.24
                      : total * 0.24}
                    €
                  </p>
                </div>
              </div>
              <h2>Έξοδα αποστολής</h2>

              <div className="flex">
                <h2>Σύνολο</h2>
                <p className="ml-auto">
                  {coupon?.percentage
                    ? total - total * coupon.percentage
                    : coupon?.fixed
                    ? total - coupon.fixed
                    : total}
                  €
                </p>
              </div>
              <Button
                type="submit"
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
      </main>
      <Footer />
    </>
  )
}
