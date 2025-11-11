'use client'

import type { typeCoupon } from '@/lib/postgres/data/type'

import HeaderProvider from '@/context/HeaderProvider'
import { envClient } from '@/envClient'
import { typeOrder } from '@/lib/postgres/data/type'
import { zodCoupon } from '@/lib/postgres/data/zod'
import { typeProductTypes, typeShipping } from '@/utils/getPostgres'
import { Button, Input, LoadingOverlay, Rating, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import axios from 'axios'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import { z } from 'zod'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { errorAxios, errorInvalidResponse } from '@/data/error'

type FormValues = Record<string, { rating: number; review: string }>

type ReviewPageClientProps = {
  orderId: typeOrder['id']
  unique_product_types: string[]
  full_name: string
  product_types: typeProductTypes
  shipping: typeShipping
}

export function ReviewPageClient({
  orderId,
  unique_product_types,
  full_name,
  product_types,
  shipping,
}: ReviewPageClientProps) {
  const router = useRouter()

  const formSchema = z.object(
    Object.fromEntries(
      unique_product_types.map((product_type) => [
        product_type,
        z.object({
          rating: z.number().min(1).max(5),
          review: z.string().refine(
            (value) => {
              const length = value.replace(/\s+/g, '').length
              return length >= 5 && length <= 150
            },
            {
              message: 'Η κριτική πρέπει να είναι μεταξύ 5 και 150 χαρακτήρες.',
            },
          ),
        }),
      ]),
    ),
  )
  const form = useForm<FormValues>({
    mode: 'controlled',
    initialValues: Object.fromEntries(
      unique_product_types.map((product_type) => [
        product_type,
        { rating: 1, review: '' },
      ]),
    ) as FormValues,
    validate: zodResolver(formSchema),
  })

  const [
    formLoadingOverlay,
    { open: openFormLoadingOverlay, close: closeFormLoadingOverlay },
  ] = useDisclosure(false)

  const [reviewSubmittedSuccessfully, setReviewSubmittedSuccessfully] =
    useState<null | typeCoupon>(null)

  return (
    <HeaderProvider product_types={product_types} shipping={shipping}>
      <main className="flex-1 container mx-auto px-6 py-12 text-black">
        {!reviewSubmittedSuccessfully ? (
          <form
            onSubmit={form.onSubmit(async (values) => {
              openFormLoadingOverlay()
              try {
                const res = await axios.post(
                  `${envClient.API_USER_URL}/review`,
                  {
                    id: orderId,
                    full_name: full_name,
                    values,
                  },
                )
                const { error, data: validatedResponse } = zodCoupon.safeParse(
                  res.data,
                )
                if (error) {
                  router.push(`${ROUTE_ERROR}?message=${errorInvalidResponse}`)
                  return
                }
                setReviewSubmittedSuccessfully(validatedResponse)
              } catch {
                router.push(`${ROUTE_ERROR}?message=${errorAxios}`)
              } finally {
                closeFormLoadingOverlay()
              }
            })}
            className="relative mx-auto max-w-[600px]"
          >
            <LoadingOverlay
              visible={formLoadingOverlay}
              zIndex={1000}
              overlayProps={{ radius: 'xs', blur: 1 }}
            />
            <h1 className="text-xl mb-6">
              Άφησε μια κρητική για κάθε προϊόν και κέρδισε εκπτωτικό κουπόνι
              15% για την επόμενη αγορά σου!
            </h1>
            {unique_product_types.map((product_type, index, array) => (
              <Input.Wrapper
                key={index}
                label={product_type}
                description="Βαθμολόγισε το προϊόν από το 1-5."
                classNames={{ label: '!text-xl mb-1' }}
                mb={`${index !== array.length - 1 ? 'lg' : undefined}`}
              >
                <Rating
                  size={23}
                  classNames={{ root: 'mt-[5px] mb-1' }}
                  key={form.key(`${product_type}.rating`)}
                  {...form.getInputProps(`${product_type}.rating`)}
                />
                <Textarea
                  description="Άφησε μια κριτική μεταξύ 10-150 χαρακτήρων."
                  autosize
                  minRows={4}
                  key={form.key(`${product_type}.review`)}
                  {...form.getInputProps(`${product_type}.review`)}
                />
              </Input.Wrapper>
            ))}
            <Button type="submit" mt="xl" color="red" size="md" radius="md">
              Ολοκλήρωση
            </Button>
          </form>
        ) : (
          <div className="mx-auto max-w-[600px]">
            <h1 className="text-xl mb-6">
              Σε ευχαριστούμε που στηρίζεις το <strong>motowear.gr</strong>.
              Συμπλήρωσε τον κωδικό:{' '}
              <span className="text-red-600">
                {reviewSubmittedSuccessfully.coupon_code}
              </span>{' '}
              για να παραλάβεις 15% έκπτωση με την επώμενη σου αγορά.
            </h1>
          </div>
        )}
      </main>
    </HeaderProvider>
  )
}
