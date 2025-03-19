'use client'

import { Header } from '@/components/Header'
import {
  getLocalStorageCart,
  LocalStorageCartItem,
  setLocalStorageCart,
} from '@/utils/localStorage'
import { useEffect, useState } from 'react'

type HomePageClientProps = {
  productTypes: string[]
}

export function HomePageClient({ productTypes }: HomePageClientProps) {
  const [cart, setCart] = useState<LocalStorageCartItem[]>([])
  useEffect(() => {
    setCart(getLocalStorageCart())
  }, [])
  useEffect(() => {
    setLocalStorageCart(cart)
  }, [cart])

  return <Header productTypes={productTypes} cart={cart} setCart={setCart} />
}
