import classes from '@/css/DndTable.module.css'

import type { typeVariant } from '@/lib/postgres/data/type'
import type { typeModal } from '@/app/admin/product/[product_type]/client/Modal'

import { Draggable } from '@hello-pangea/dnd'
import { Table } from '@mantine/core'
import { RxDragHandleDots2 } from 'react-icons/rx'
import { memo, Fragment, Dispatch, SetStateAction } from 'react'
import { ProductVariantRow } from '@/app/admin/product/[product_type]/client/ProductVariantRow'

export const ProductVariantRowWrapper = memo(
  ProductVariantRowWrapperNotMemoised,
)

type ProductVariantRowWrapperProps = {
  rowKey: string
  index: number
  variant: typeVariant
  common: {
    collection: string
    imagesMinio: string[]
    brandsPostgres: string[]
    onRequest: boolean
    setVariants: Dispatch<SetStateAction<typeVariant[]>>
    setModalState: Dispatch<SetStateAction<typeModal>>
    openModal: () => void
    setOnRequest: Dispatch<SetStateAction<boolean>>
  }
}

export function ProductVariantRowWrapperNotMemoised({
  rowKey,
  index,
  variant,
  common,
}: ProductVariantRowWrapperProps) {
  const {
    collection,
    imagesMinio,
    brandsPostgres,
    onRequest,
    setVariants,
    setModalState,
    openModal,
    setOnRequest,
  } = common

  return (
    <Draggable draggableId={rowKey} index={index}>
      {(provided) => (
        <Table.Tr
          className={classes.item}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Fragment key={rowKey}>
            <Table.Td>
              <div className={classes.dragHandle} {...provided.dragHandleProps}>
                <RxDragHandleDots2 size={20} />
              </div>
            </Table.Td>
            <ProductVariantRow
              index={index}
              variant={variant}
              collection={collection}
              imagesMinio={imagesMinio}
              brandsPostgres={brandsPostgres}
              setVariants={setVariants}
              setModalState={setModalState}
              openModal={openModal}
              onRequest={onRequest}
              setOnRequest={setOnRequest}
            />
          </Fragment>
        </Table.Tr>
      )}
    </Draggable>
  )
}
