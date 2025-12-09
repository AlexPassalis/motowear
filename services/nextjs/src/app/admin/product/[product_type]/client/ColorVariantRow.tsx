import type { ColorVariant, Collection } from '@/lib/postgres/data/type'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import { Button, NumberInput, Select, MultiSelect, Table, TextInput } from '@mantine/core'
import { Dispatch, memo, SetStateAction } from 'react'
import { colorPalette } from '@/data/colorPalette'

export const ColorVariantRow = memo(
  ColorVariantRowNotMemoised,
  (prev, next) => prev.variant === next.variant && prev.onRequest === next.onRequest,
)

type ColorVariantRowProps = {
  collection: Collection
  images_minio: string[]
  brands_postgres: string[]
  variant: ColorVariant
  color_variants: ColorVariant[]
  setColorVariants: Dispatch<SetStateAction<ColorVariant[]>>
  upsells_select_data: { label: string; value: string }[]
  setModalState: Dispatch<SetStateAction<typeModal>>
  openModal: () => void
  onRequest: boolean
}

function ColorVariantRowNotMemoised({
  collection,
  images_minio,
  brands_postgres,
  variant,
  color_variants,
  setColorVariants,
  upsells_select_data,
  setModalState,
  openModal,
  onRequest,
}: ColorVariantRowProps) {
  function update_variant(updates: Partial<ColorVariant>) {
    setColorVariants((prev) =>
      prev.map((item) => (item.id === variant.id ? { ...item, ...updates } : item)),
    )
  }

  function handle_delete() {
    if (color_variants.length <= 1) {
      alert('Cannot delete last color. Delete entire product from Products table.')

      return
    }

    setColorVariants((prev) => prev.filter((item) => item.id !== variant.id))
  }

  return (
    <Table.Tr>
      <Table.Td>
        <TextInput
          value={variant.name}
          onChange={(e) => {
            update_variant({ name: e.target.value })
          }}
          disabled={onRequest}
          placeholder="Product name"
        />
      </Table.Td>

      <Table.Td>
        <Select
          data={brands_postgres}
          value={variant.brand}
          onChange={(brand) => {
            update_variant({ brand })
          }}
          searchable
          clearable
          disabled={onRequest}
          placeholder="Select brand"
        />
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            setModalState({
              type: 'DESCRIPTION',
              index: 0,
              product_id: variant.id,
            })
            openModal()
          }}
          color="blue"
          disabled={onRequest}
        >
          {variant.description && variant.description.length > 0 ? '...' : ''}
        </Button>
      </Table.Td>

      <Table.Td>
        <NumberInput
          value={variant.price || undefined}
          onChange={(e) => {
            update_variant({ price: e ? Number(e) : null })
          }}
          min={0}
          max={9999.99}
          suffix="€"
          placeholder={collection.price ? `${collection.price}€` : undefined}
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td>
        <NumberInput
          value={variant.price_before || undefined}
          onChange={(e) => {
            update_variant({ price_before: e ? Number(e) : null })
          }}
          min={0}
          max={9999.99}
          suffix="€"
          placeholder={
            collection.price_before ? `${collection.price_before}€` : undefined
          }
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td>
        <Select
          data={colorPalette}
          value={variant.color}
          onChange={(value) => {
            update_variant({ color: value })
          }}
          searchable
          clearable
          disabled={onRequest}
          placeholder="Select color"
        />
      </Table.Td>

      <Table.Td>
        <MultiSelect
          data={images_minio}
          value={variant.images}
          onChange={(images) => {
            update_variant({ images })
          }}
          searchable
          maxDropdownHeight={200}
          disabled={onRequest}
          placeholder={variant.images.length === 0 ? "Select images" : undefined}
        />
      </Table.Td>

      <Table.Td>
        <Select
          data={upsells_select_data}
          value={
            variant.upsell_collection && variant.upsell_product
              ? `${variant.upsell_collection}::${variant.upsell_product}`
              : null
          }
          onChange={(value) => {
            if (value) {
              const parts = value.split('::')
              if (parts.length === 2) {
                update_variant({
                  upsell_collection: parts[0],
                  upsell_product: parts[1],
                })
              }
            } else {
              update_variant({
                upsell_collection: null,
                upsell_product: null,
              })
            }
          }}
          placeholder="Select upsell"
          searchable
          clearable
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            setModalState({
              type: 'SIZES',
              index: 0,
              product_id: variant.id,
            })
            openModal()
          }}
          color="blue"
          disabled={onRequest}
        >
          {variant.sizes && variant.sizes.length > 0 ? variant.sizes.length : ''}
        </Button>
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            update_variant({ sold_out: !variant.sold_out })
          }}
          color={variant.sold_out ? 'red' : 'green'}
          disabled={onRequest}
        >
          {variant.sold_out ? 'Yes' : 'No'}
        </Button>
      </Table.Td>

      <Table.Td>
        <Button
          onClick={handle_delete}
          type="button"
          disabled={onRequest}
          color="red"
        >
          Delete
        </Button>
      </Table.Td>
    </Table.Tr>
  )
}
