import type { Product } from '@/lib/postgres/data/type'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'
import type { ProductWithCollectionName } from '@/app/admin/product/[product_type]/client/index'

import { Button, NumberInput, Table, TextInput } from '@mantine/core'
import { Dispatch, memo, SetStateAction } from 'react'

import axios from 'axios'
import { envClient } from '@/envClient'
import { ERROR } from '@/data/magic'

export const ProductVariantRow = memo(
  ProductVariantRowNotMemoised,
  (prev, next) =>
    prev.product === next.product && prev.onRequest === next.onRequest,
)

type ProductVariantProps = {
  collection: string
  images_minio: string[]
  brands_postgres: string[]
  product: ProductWithCollectionName
  setProducts: Dispatch<SetStateAction<ProductWithCollectionName[]>>
  setModalState: Dispatch<SetStateAction<typeModal>>
  openModal: () => void
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

function ProductVariantRowNotMemoised({
  collection,
  images_minio,
  brands_postgres,
  product,
  setProducts,
  setModalState,
  openModal,
  onRequest,
  setOnRequest,
}: ProductVariantProps) {
  function updateProduct(updates: Partial<Product>) {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, ...updates } : item,
      ),
    )
  }

  return (
    <>
      <Table.Td>
        <TextInput
          defaultValue={product.name}
          onBlur={(e) => {
            updateProduct({ name: e.target.value })
          }}
          placeholder="crypton-x"
        />
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            setModalState({
              type: 'DESCRIPTION',
              index: 0,
              product_id: product.id,
            })
            openModal()
          }}
          color="blue"
          disabled={onRequest}
        >
          {product.description && product.description.length > 0 && '...'}
        </Button>
      </Table.Td>

      <Table.Td>
        <NumberInput
          value={product.price || 0}
          onChange={(e) => {
            updateProduct({ price: Number(e) })
          }}
          min={0}
          max={9999.99}
          suffix="€"
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td>
        <NumberInput
          value={product.price_before || 0}
          onChange={(e) => {
            updateProduct({ price_before: Number(e) })
          }}
          min={0}
          max={9999.99}
          suffix="€"
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            setModalState({ type: 'SIZE', index: 0, product_id: product.id })
            openModal()
          }}
          color="blue"
          disabled={onRequest}
        >
          {product.color || ''}
        </Button>
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            setModalState({ type: 'UPSELL', index: 0, product_id: product.id })
            openModal()
          }}
          color="blue"
          disabled={onRequest}
        >
          {product.upsell && '...'}
        </Button>
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            updateProduct({ sold_out: !product.sold_out })
          }}
          color={product.sold_out ? 'red' : 'green'}
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td>
        <Button
          onClick={async () => {
            if (product.id) {
              setOnRequest(true)
              try {
                const res = await axios.delete(
                  `${envClient.API_ADMIN_URL}/product/collection/product`,
                  {
                    data: {
                      id: product.id,
                      collection_id: product.collection_id,
                    },
                  },
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  alert(
                    `Error deleting ${product.id}: ${
                      res.data?.message || ERROR.unexpected
                    }`,
                  )
                  console.error(res)
                }
              } catch (err) {
                alert(`Error deleting ${product.id}`)
                console.error(err)
              }
              setOnRequest(false)
            } else {
              setProducts((prev) =>
                prev.filter((item) => item.id !== product.id),
              )
            }
          }}
          type="button"
          disabled={onRequest}
          color="red"
          className="ml-auto"
        >
          {onRequest ? 'Wait ...' : 'Delete'}
        </Button>
      </Table.Td>
    </>
  )
}
