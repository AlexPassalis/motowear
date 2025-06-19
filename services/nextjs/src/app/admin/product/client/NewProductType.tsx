import type { typeProductTypes } from '@/utils/getPostgres'

import { Button, TextInput } from '@mantine/core'
import { errorUnexpected } from '@/data/error'
import { envClient } from '@/env'
import axios from 'axios'
import { Dispatch, SetStateAction, useRef } from 'react'

type NewProductTypeProps = {
  productTypesPostgres: typeProductTypes
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

export function NewProductType({
  productTypesPostgres,
  onRequest,
  setOnRequest,
}: NewProductTypeProps) {
  const newProductTypeRef = useRef<null | HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-4 h-full p-2 border border-neutral-300 rounded-lg bg-white">
      <h1 className="text-center text-2xl">Create Product Type</h1>
      <form
        onSubmit={async e => {
          e.preventDefault()
          const newProductType = newProductTypeRef.current?.value ?? ''
          if (!newProductType) {
            alert('Invalid product type input')
            return
          }
          if (newProductType in productTypesPostgres) {
            alert(`Product type "${newProductType}" already exists.`)
            return
          }

          setOnRequest(true)
          try {
            const res = await axios.post(
              `${envClient.API_ADMIN_URL}/product/product_type`,
              {
                product_type: newProductType,
              }
            )
            if (res.status === 200) {
              window.location.reload()
            } else {
              alert(
                `Error creating product type: ${
                  res.data?.message || errorUnexpected
                }`
              )
              console.error(res)
            }
          } catch (e) {
            alert('Error creating product type')
            console.error(e)
          }
          if (newProductTypeRef.current) {
            newProductTypeRef.current.value = ''
          }
          setOnRequest(false)
        }}
        className="flex justify-center gap-2 mt-auto"
      >
        <TextInput id="newProductType" type="text" ref={newProductTypeRef} />
        <Button type="submit" disabled={onRequest} color="green">
          {onRequest ? 'Wait ...' : 'Create'}
        </Button>
      </form>
    </div>
  )
}
