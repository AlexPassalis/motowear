import type { typeVariant } from '@/lib/postgres/data/type'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import {
  Button,
  MultiSelect,
  NumberInput,
  Select,
  Table,
  TextInput,
} from '@mantine/core'
import { Dispatch, memo, SetStateAction } from 'react'

import axios from 'axios'
import { envClient } from '@/env'
import { errorUnexpected } from '@/data/error'

export const ProductVariantRow = memo(
  ProductVariantRowNotMemoised,
  (prev, next) =>
    prev.variant === next.variant && prev.onRequest === next.onRequest,
)

type ProductVariantProps = {
  product_type: string
  imagesMinio: string[]
  brandsPostgres: string[]
  index: number
  variant: typeVariant
  setVariants: Dispatch<SetStateAction<typeVariant[]>>
  setModalState: Dispatch<SetStateAction<typeModal>>
  openModal: () => void
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

function ProductVariantRowNotMemoised({
  product_type,
  imagesMinio,
  brandsPostgres,
  index,
  variant,
  setVariants,
  setModalState,
  openModal,
  onRequest,
  setOnRequest,
}: ProductVariantProps) {
  return (
    <>
      <Table.Td>{variant.id}</Table.Td>

      <Table.Td>
        <TextInput
          defaultValue={variant.name}
          onBlur={(e) =>
            setVariants((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, name: e.target.value } : item,
              ),
            )
          }
          placeholder="crypton-x"
        />
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            setModalState({ type: 'DESCRIPTION', index: index })
            openModal()
          }}
          color="blue"
          disabled={onRequest}
        >
          {variant.description.length > 0 && '...'}
        </Button>
      </Table.Td>

      <Table.Td>
        <MultiSelect
          data={imagesMinio}
          value={variant.images}
          onChange={(value) =>
            setVariants((prev) =>
              prev.map((v, i) => {
                if (i === index) {
                  if (value.length > v.images.length) {
                    const [newImg] = value.filter(
                      (img) => !v.images.includes(img),
                    )
                    return { ...v, images: [newImg, ...v.images] }
                  } else {
                    return { ...v, images: value }
                  }
                }
                return v
              }),
            )
          }
          disabled={onRequest}
          style={{
            width: 200,
            justifySelf: 'center',
          }}
          searchable
          nothingFoundMessage="Nothing found..."
          checkIconPosition="right"
          hidePickedOptions
          maxDropdownHeight={200}
        />
      </Table.Td>

      <Table.Td>
        <NumberInput
          value={Number(variant.price)}
          onChange={(e) =>
            setVariants((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, price: Number(e) } : item,
              ),
            )
          }
          min={0}
          max={9999.99}
          suffix="€"
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td>
        <Select
          data={brandsPostgres}
          defaultValue={variant.brand}
          onBlur={(e) =>
            setVariants((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, brand: e.target.value } : item,
              ),
            )
          }
          placeholder="Yamaha"
          disabled={onRequest}
          checkIconPosition="right"
          maxDropdownHeight={200}
          searchable
          nothingFoundMessage="Nothing found..."
        />
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            setModalState({ type: 'COLOR', index: index })
            openModal()
          }}
          color={variant.color || ''}
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td>
        <TextInput
          defaultValue={variant.size}
          onBlur={(e) =>
            setVariants((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, size: e.target.value } : item,
              ),
            )
          }
          placeholder="M"
        />
      </Table.Td>

      <Table.Td>
        <NumberInput
          value={Number(variant.price_before)}
          onChange={(e) =>
            setVariants((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, price_before: Number(e) } : item,
              ),
            )
          }
          min={0}
          max={9999.99}
          suffix="€"
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            setModalState({ type: 'UPSELL', index: index })
            openModal()
          }}
          color="blue"
          disabled={onRequest}
        >
          {variant.upsell && '...'}
        </Button>
      </Table.Td>

      <Table.Td>
        <Button
          onClick={async () => {
            if (variant.id) {
              setOnRequest(true)
              try {
                const res = await axios.delete(
                  `${envClient.API_ADMIN_URL}/product/product_type/variant`,
                  {
                    data: {
                      id: variant.id,
                      product_type: product_type,
                    },
                  },
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  alert(
                    `Error deleting ${variant.id}: ${
                      res.data?.message || errorUnexpected
                    }`,
                  )
                  console.error(res)
                }
              } catch (err) {
                alert(`Error deleting ${variant.id}`)
                console.error(err)
              }
              setOnRequest(false)
            } else {
              setVariants((prev) => prev.filter((_, i) => i !== index))
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
