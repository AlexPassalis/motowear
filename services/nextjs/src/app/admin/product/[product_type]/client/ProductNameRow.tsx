import type { ProductNameGroup } from '@/lib/postgres/data/type'

import { Badge, Table, Button } from '@mantine/core'
import { memo } from 'react'

export const ProductNameRow = memo(
  ProductNameRowNotMemoised,
  (prev, next) => prev.group === next.group && prev.onRequest === next.onRequest
)

type ProductNameRowProps = {
  group: ProductNameGroup
  onClick: () => void
  onDelete: () => void
  onRequest: boolean
}

function ProductNameRowNotMemoised({ group, onClick, onDelete, onRequest }: ProductNameRowProps) {
  return (
    <Table.Tr
      style={{ cursor: 'pointer' }}
      className="hover:!bg-blue-100 transition-colors"
    >
      <Table.Td onClick={onClick}>{group.name}</Table.Td>
      <Table.Td onClick={onClick} style={{ textAlign: 'center' }}>
        <Badge color="blue">{group.color_count} colors</Badge>
      </Table.Td>
      <Table.Td
        onClick={(e) => {
          e.stopPropagation()
        }}
        style={{ textAlign: 'center' }}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          color="red"
          disabled={onRequest}
          size="sm"
        >
          Delete
        </Button>
      </Table.Td>
    </Table.Tr>
  )
}
