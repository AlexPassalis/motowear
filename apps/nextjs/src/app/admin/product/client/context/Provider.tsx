'use client'

import { Product } from '@/data/types'
import {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'

type Context = {
  productPostgres: Product
  productNew: Product
  setProductNew: Dispatch<SetStateAction<Product>>
  imageNew: File[]
  setImageNew: Dispatch<SetStateAction<File[]>>
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
  newProductTypeRef: RefObject<HTMLInputElement | null>
  deleteProductType: string
  setDeleteProductType: Dispatch<SetStateAction<string>>
  dialogRef: RefObject<HTMLDialogElement | null>
  openDialog: () => void
  closeDialog: () => void
}

export const Context = createContext<null | Context>(null)

type ContextProviderProps = {
  productPostgres: Product
  children: ReactNode
}

export function ContextProvider({
  productPostgres,
  children,
}: ContextProviderProps) {
  const [productNew, setProductNew] = useState(productPostgres)
  const [imageNew, setImageNew] = useState<File[]>([])

  const [onRequest, setOnRequest] = useState(false)

  const newProductTypeRef = useRef<null | HTMLInputElement>(null)

  const [deleteProductType, setDeleteProductType] = useState('')
  const dialogRef = useRef<null | HTMLDialogElement>(null)
  function openDialog() {
    dialogRef.current?.showModal()
  }
  function closeDialog() {
    dialogRef.current?.close()
  }

  console.log('This is the productNew: ', productNew)
  console.log('This is the imageNew: ', imageNew)

  return (
    <Context.Provider
      value={{
        productPostgres,
        productNew,
        setProductNew,
        imageNew,
        setImageNew,
        onRequest,
        setOnRequest,
        newProductTypeRef,
        deleteProductType,
        setDeleteProductType,
        dialogRef,
        openDialog,
        closeDialog,
      }}
    >
      {children}
    </Context.Provider>
  )
}
