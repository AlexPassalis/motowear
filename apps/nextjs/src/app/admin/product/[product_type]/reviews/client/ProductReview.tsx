import { typeReview } from '@/lib/postgres/data/type'
import { Button, NumberInput, Table, TextInput } from '@mantine/core'
import { Dispatch, memo, SetStateAction } from 'react'
import { DateInput } from '@mantine/dates'
import axios from 'axios'
import { envClient } from '@/env'
import { errorUnexpected } from '@/data/error'

export const ProductReview = memo(ProductVariantNotMemoised)

type ProductReviewProps = {
  product_type: string
  index: number
  productReviews: typeReview[]
  setProductReviews: Dispatch<SetStateAction<typeReview[]>>
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

function ProductVariantNotMemoised({
  product_type,
  index,
  productReviews,
  setProductReviews,
  onRequest,
  setOnRequest,
}: ProductReviewProps) {
  return (
    <>
      <Table.Td style={{ textAlign: 'center' }}>
        <NumberInput
          value={productReviews[index]?.rating}
          onChange={e =>
            setProductReviews(prev =>
              prev.map((item, i) =>
                i === index ? { ...item, rating: Number(e) } : item
              )
            )
          }
          min={1}
          max={5}
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td>
        <TextInput
          defaultValue={productReviews[index]?.full_name}
          onBlur={e =>
            setProductReviews(prev =>
              prev.map((item, i) =>
                i === index ? { ...item, full_name: e.target.value } : item
              )
            )
          }
          placeholder="Φίλιππος Χατζηκαντής"
        />
      </Table.Td>

      <Table.Td>
        <TextInput
          defaultValue={productReviews[index]?.review}
          onBlur={e =>
            setProductReviews(prev =>
              prev.map((item, i) =>
                i === index ? { ...item, review: e.target.value } : item
              )
            )
          }
          placeholder="Αγόρασε το crypton-x μπλουζάκι και θα αλλάξει η ζωή σου (προς το χειρότερο)."
        />
      </Table.Td>

      <Table.Td>
        <DateInput
          placeholder="Διάλεξε μέρα"
          defaultValue={
            productReviews[index]?.date
              ? new Date(productReviews[index]?.date)
              : new Date()
          }
          onBlur={e =>
            setProductReviews(prev =>
              prev.map((item, i) =>
                i === index ? { ...item, date: e.target.value } : item
              )
            )
          }
        />
      </Table.Td>

      <Table.Td>
        <Button
          onClick={async () => {
            if (productReviews[index]?.id) {
              setOnRequest(true)
              try {
                const res = await axios.delete(
                  `${envClient.API_ADMIN_URL}/product/product_type/variant`,
                  {
                    data: {
                      id: productReviews[index].id,
                      product_type: product_type,
                    },
                  }
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  alert(
                    `Error deleting ${productReviews[index].id}: ${
                      res.data?.message || errorUnexpected
                    }`
                  )
                  console.error(res)
                }
              } catch (e) {
                alert(`Error deleting ${productReviews[index].id}`)
                console.error(e)
              }
              setOnRequest(false)
            } else {
              setProductReviews(prev => prev.filter((_, i) => i !== index))
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
