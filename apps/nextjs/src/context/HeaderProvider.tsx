import type {
  typeVariant,
  typeCartLocalStorage,
  typeCoupon,
} from '@/lib/postgres/data/type'
import type { typeShipping } from '@/utils/getPostgres'

import { Menu } from '@/components/Menu'
import { Search } from '@/components/Search'
import { Cart } from '@/components/Cart'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  getFilteredLocalStorageCart,
  getLocalStorageCoupon,
  setLocalStorageCart,
  setLocalStorageCoupon,
} from '@/utils/localStorage'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { Button, LoadingOverlay, Modal, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { envClient } from '@/env'
import axios from 'axios'
import { zodCoupon } from '@/lib/postgres/data/zod'
import { useRouter } from 'next/navigation'
import { ROUTE_ERROR, ROUTE_PRODUCT } from '@/data/routes'
import { errorAxios, errorInvalidResponse } from '@/data/error'
import Link from 'next/link'
import { Image } from '@mantine/core'
import NextImage from 'next/image'

type HeaderContext = {
  setCart: Dispatch<SetStateAction<typeCartLocalStorage>>
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
}

export const HeaderContext = createContext<HeaderContext | null>(null)

type HeaderProviderProps = {
  product_types: string[]
  all_variants: typeVariant[]
  shipping: typeShipping
  children: ReactNode
}

export default function HeaderProvider({
  product_types,
  all_variants,
  shipping,
  children,
}: HeaderProviderProps) {
  const router = useRouter()
  const [hasMounted, setHasMounted] = useState(false)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [cart, setCart] = useState<typeCartLocalStorage>([])
  useEffect(() => {
    setCart(getFilteredLocalStorageCart(all_variants))
    setHasMounted(true)
  }, [all_variants])
  useEffect(() => {
    if (hasMounted) {
      setLocalStorageCart(cart)
    }
  }, [cart])

  const [coupon, setCoupon] = useState<null | typeCoupon>(null)
  useEffect(() => {
    setCoupon(getLocalStorageCoupon())
    setHasMounted(true)
  }, [])
  useEffect(() => {
    if (hasMounted) {
      setLocalStorageCoupon(coupon)
    }
  }, [coupon])

  const [emailModal, { open: openEmailModal, close: closeEmailModal }] =
    useDisclosure(false)
  useEffect(() => {
    const email_submitted = localStorage.getItem('email_submitted')
    if (!email_submitted) {
      const timer = setTimeout(() => openEmailModal(), 5000)
      return () => clearTimeout(timer)
    }
  }, [])
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: zodResolver(z.object({ email: z.string().email() })),
  })
  const [emailResponse, setEmailResponse] = useState<
    undefined | null | typeCoupon
  >(undefined)
  const [loadingOverlay, { open, close }] = useDisclosure(false)

  return (
    <HeaderContext.Provider
      value={{
        setCart,
        setIsSearchOpen,
        setIsCartOpen,
      }}
    >
      <Modal
        opened={emailModal}
        onClose={() => closeEmailModal()}
        title={`${
          emailResponse === null
            ? 'Αυτό το email έχει ήδη χρησιμοποιηθεί. Δοκίμασε ξανά.'
            : 'Δώσε μας το email σου και πάρε δωρεάν μπρελόκ πιστόνη στην επώμενη αγορά σου.'
        }`}
        classNames={{
          title: `${emailResponse === null ? '!text-red-600' : ''}`,
        }}
        style={{ position: 'relative' }}
        centered
      >
        <LoadingOverlay
          visible={loadingOverlay}
          zIndex={1000}
          overlayProps={{ radius: 'xs', blur: 1 }}
        />
        <form
          className="flex flex-col"
          onSubmit={form.onSubmit(async values => {
            open()
            try {
              const res = await axios.post(`${envClient.API_USER_URL}/email`, {
                email: values.email,
              })
              if (res.status === 209) {
                setEmailResponse(null)
                form.setValues({ email: '' })
              } else if (res.status === 200) {
                const { error: err, data: validatedResponse } = z
                  .object({
                    coupon: zodCoupon.extend({
                      coupon_code: z.literal('FREE-MPRELOK'),
                    }),
                  })
                  .safeParse(res.data)
                if (err) {
                  router.push(
                    `${ROUTE_ERROR}?message=${errorInvalidResponse}-email`
                  )
                } else {
                  setEmailResponse(validatedResponse.coupon)
                  setCoupon(validatedResponse.coupon)
                  closeEmailModal()
                  localStorage.setItem('email_submitted', 'true')
                }
              } else {
              }
            } catch {
              router.push(`${ROUTE_ERROR}?message=${errorAxios}`)
            } finally {
              close()
            }
          })}
        >
          <div className="flex w-full h-36 mb-2 rounded-lg border border-[var(--mantine-border)]">
            <Link
              href={`${ROUTE_PRODUCT}/Μπρελόκ/Πιστόνι`}
              className="relative w-1/3 h-full rounded-lg overflow-hidden"
            >
              <Image
                component={NextImage}
                src={`${envClient.MINIO_PRODUCT_URL}/Μπρελόκ/Πιστόνι`}
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

          <TextInput
            label="Email"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />

          <Button type="submit" mt="lg" color="red" size="sm" radius="md">
            Υποβολή
          </Button>
        </form>
      </Modal>
      <Menu
        product_types={product_types}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      <Cart
        cart={cart}
        setCart={setCart}
        shipping={shipping}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        coupon={coupon}
        setCoupon={setCoupon}
      />
      <div
        onClick={() => {
          if (isMenuOpen) setIsMenuOpen(false)
          if (isSearchOpen) setIsSearchOpen(false)
          if (isCartOpen) setIsCartOpen(false)
        }}
        className="min-h-screen flex flex-col z-10 w-full h-full"
      >
        <Header
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cart={cart}
        />
        {children}
        <Footer />
      </div>
    </HeaderContext.Provider>
  )
}
