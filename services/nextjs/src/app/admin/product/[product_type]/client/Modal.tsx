import type { typeUpsells, typeVariant } from '@/lib/postgres/data/type'
import type { typeBrands } from '@/utils/getPostgres'

import {
  Modal as MantineModal,
  MultiSelect,
  NumberInput,
  Textarea,
  TextInput,
} from '@mantine/core'
import { Dispatch, memo, SetStateAction } from 'react'
import { Select } from '@mantine/core'
import { colorPalette } from '@/data/colorPalette'

export type typeModal = {
  type:
    | ''
    | 'ALL_NAME'
    | 'ALL_DESCRIPTION'
    | 'ALL_IMAGES'
    | 'ALL_PRICE'
    | 'ALL_BRAND'
    | 'ALL_COLOR'
    | 'ALL_SIZE'
    | 'ALL_PRICE_BEFORE'
    | 'ALL_UPSELL'
    | 'DESCRIPTION'
    | 'COLOR'
    | 'UPSELL'
  index: number
}

export const Modal = memo(ModalNotMemoised)

type ModalProps = {
  imagesMinio: string[]
  variantsPostgres: typeVariant[]
  brandsPostgres: typeBrands
  variants: typeVariant[]
  setVariants: Dispatch<SetStateAction<typeVariant[]>>
  modalState: typeModal
  setModalState: Dispatch<SetStateAction<typeModal>>
  modalOpened: boolean
  closeModal: () => void
}

function ModalNotMemoised({
  imagesMinio,
  variantsPostgres,
  brandsPostgres,
  variants,
  setVariants,
  modalState,
  setModalState,
  modalOpened,
  closeModal,
}: ModalProps) {
  const upsells: typeUpsells = variantsPostgres
    .map((variant) => ({
      product_type: variant.product_type,
      name: variant.name,
    }))
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (other) =>
            other.product_type === item.product_type &&
            other.name === item.name,
        ),
    )

  function stringifyUpsell(u: typeUpsells[number]) {
    return `${u.product_type}@@${u.name}`
  }

  const upsellsSelectData = upsells.map((item) => ({
    label: `${item.product_type} ${item.name}`,
    value: stringifyUpsell(item),
  }))

  return (
    <MantineModal
      opened={modalOpened}
      onClose={() => {
        closeModal()
        setModalState({
          type: '',
          index: 0,
        })
      }}
      title={`Index: ${modalState.index}`}
      centered
    >
      <>
        {modalState.type === 'ALL_NAME' && (
          <TextInput
            placeholder="crypton-x"
            onBlur={(e) =>
              setVariants((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  name: e.target.value,
                })),
              )
            }
          />
        )}

        {modalState.type === 'ALL_DESCRIPTION' && (
          <Textarea
            placeholder="This is the product description."
            autosize
            minRows={10}
            onChange={(e) =>
              setVariants((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  description: e.target.value,
                })),
              )
            }
          />
        )}

        {modalState.type === 'ALL_IMAGES' && (
          <MultiSelect
            data={imagesMinio}
            onChange={(e) =>
              setVariants((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  images: e,
                })),
              )
            }
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
        )}

        {modalState.type === 'ALL_PRICE' && (
          <NumberInput
            onChange={(e) =>
              setVariants((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  price: Number(e),
                })),
              )
            }
            min={0}
            max={9999.99}
            suffix="€"
          />
        )}

        {modalState.type === 'ALL_BRAND' && (
          <Select
            data={brandsPostgres}
            placeholder="Yamaha"
            onBlur={(e) =>
              setVariants((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  brand: e.target.value,
                })),
              )
            }
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
          />
        )}

        {modalState.type === 'ALL_COLOR' && (
          <Select
            data={colorPalette}
            onChange={(value) => {
              if (value) {
                setVariants((prevRows) =>
                  prevRows.map((item) => ({
                    ...item,
                    color: value,
                  })),
                )
              }
            }}
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
          />
        )}

        {modalState.type === 'ALL_SIZE' && (
          <TextInput
            placeholder="M"
            onBlur={(e) =>
              setVariants((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  size: e.target.value,
                })),
              )
            }
          />
        )}

        {modalState.type === 'ALL_PRICE_BEFORE' && (
          <NumberInput
            onChange={(e) =>
              setVariants((prevRows) =>
                prevRows.map((item) => ({
                  ...item,
                  price_before: Number(e),
                })),
              )
            }
            min={0}
            max={9999.99}
            suffix="€"
          />
        )}

        {modalState.type === 'ALL_UPSELL' && (
          <Select
            data={upsellsSelectData}
            value={
              variants.every(
                (v) =>
                  v.upsell &&
                  stringifyUpsell(v.upsell) ===
                    stringifyUpsell(variants[0].upsell!),
              )
                ? stringifyUpsell(variants[0].upsell!)
                : null
            }
            onChange={(value) => {
              setVariants((prev) => {
                if (!value) return prev.map((v) => ({ ...v, upsell: null }))
                const upsell = upsells.find(
                  (up) => stringifyUpsell(up) === value,
                )!
                return prev.map((v) => ({ ...v, upsell }))
              })
            }}
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
          />
        )}

        {modalState.type === 'DESCRIPTION' && (
          <Textarea
            value={variants[modalState.index].description}
            autosize
            minRows={10}
            onChange={(e) =>
              setVariants((prevRows) =>
                prevRows.map((item, idx) =>
                  idx === modalState.index
                    ? { ...item, description: e.target.value }
                    : item,
                ),
              )
            }
            placeholder="This is the product description."
          />
        )}

        {modalState.type === 'COLOR' && (
          <Select
            data={colorPalette}
            defaultValue={variants[modalState.index].color}
            onChange={(value) => {
              if (value) {
                setVariants((prevRows) =>
                  prevRows.map((item, idx) =>
                    idx === modalState.index ? { ...item, color: value } : item,
                  ),
                )
              }
            }}
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
          />
        )}

        {modalState.type === 'UPSELL' && (
          <Select
            data={upsellsSelectData}
            value={
              variants[modalState.index].upsell
                ? stringifyUpsell(variants[modalState.index].upsell!)
                : null
            }
            onChange={(value) => {
              if (value) {
                const upsell = upsells.find(
                  (up) => stringifyUpsell(up) === value,
                )!
                setVariants((prev) =>
                  prev.map((v, idx) =>
                    idx === modalState.index ? { ...v, upsell } : v,
                  ),
                )
              } else {
                setVariants((prev) =>
                  prev.map((v, idx) =>
                    idx === modalState.index ? { ...v, upsell: null } : v,
                  ),
                )
              }
            }}
            checkIconPosition="right"
            maxDropdownHeight={200}
            searchable
            nothingFoundMessage="Nothing found..."
          />
        )}
      </>
    </MantineModal>
  )
}
