'use client'

import { Header } from '@/components/Header'
import { ProductRow } from '@/data/types'
import {
  getLocalStorageCart,
  LocalStorageCartItem,
  setLocalStorageCart,
} from '@/utils/localStorage'
import { useEffect, useState } from 'react'

type CollectionPageClientProps = {
  paramsType: string
  productTypes: string[]
  postgresVersions: ProductRow[]
  uniqueBrands: string[]
  uniqueVersions: string[]
}

export function CollectionPageClient({
  paramsType,
  productTypes,
  postgresVersions,
  uniqueBrands,
  uniqueVersions,
}: CollectionPageClientProps) {
  console.log(paramsType)
  console.log(postgresVersions)
  console.log(uniqueBrands)
  console.log(uniqueVersions)

  const [cart, setCart] = useState<LocalStorageCartItem[]>([])
  useEffect(() => {
    setCart(getLocalStorageCart())
  }, [])
  useEffect(() => {
    setLocalStorageCart(cart)
  }, [cart])

  return (
    <>
      <Header productTypes={productTypes} cart={cart} setCart={setCart} />
    </>
  )
}
