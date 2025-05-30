import classes from '@/css/DndTable.module.css'

import { typeReview } from '@/lib/postgres/data/type'
import { zodTypeReviews } from '@/lib/postgres/data/zod'

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import {
  Dispatch,
  Fragment,
  memo,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { RxDragHandleDots2 } from 'react-icons/rx'
import { Button, Table } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { errorUnexpected } from '@/data/error'
import { envClient } from '@/env'
import axios from 'axios'
import { ProductReview } from '@/app/admin/product/[product_type]/reviews/client/ProductReview'

export const ProductReviewsTable = memo(ProductReviewsTableNotMemoised)

type ProductReviewsTableProps = {
  product_type: string
  product_reviews: typeReview[]
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

function ProductReviewsTableNotMemoised({
  product_type,
  product_reviews,
  onRequest,
  setOnRequest,
}: ProductReviewsTableProps) {
  const [productReviews, setProductReviews] = useState(product_reviews)
  const [state, handlers] = useListState(product_reviews)
  useEffect(() => {
    handlers.setState(productReviews)
  }, [productReviews])

  return (
    <Table.ScrollContainer
      minWidth={420}
      style={{ minHeight: '200px' }}
      className="border border-neutral-300 rounded-lg bg-white m-4"
    >
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          if (!destination || destination.index === source.index) return
          const reordered = [...state]
          const [moved] = reordered.splice(source.index, 1)
          reordered.splice(destination.index, 0, moved)
          setProductReviews(reordered)
        }}
      >
        <Table key={product_type} miw={700}>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: 'none' }}>
              <Table.Th
                colSpan={6}
                style={{ textAlign: 'center' }}
                className="text-2xl font-bold"
              >
                {product_type}
              </Table.Th>
            </Table.Tr>

            <Table.Tr>
              <Table.Th />
              <Table.Th style={{ textAlign: 'center' }}>Rating</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Full Name</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Review</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Date</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>

          <Droppable droppableId="dnd-list" direction="vertical">
            {provided => (
              <Table.Tbody {...provided.droppableProps} ref={provided.innerRef}>
                {state.map((version, index) => (
                  <Draggable
                    key={`${index.toString()}`}
                    index={index}
                    draggableId={`${index.toString()}`}
                  >
                    {provided => (
                      <Table.Tr
                        className={classes.item}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Fragment key={index}>
                          <Table.Td>
                            <div
                              className={classes.dragHandle}
                              {...provided.dragHandleProps}
                            >
                              <RxDragHandleDots2 size={20} />
                            </div>
                          </Table.Td>
                          <ProductReview
                            key={index}
                            product_type={product_type}
                            index={index}
                            productReviews={productReviews}
                            setProductReviews={setProductReviews}
                            onRequest={onRequest}
                            setOnRequest={setOnRequest}
                          />
                        </Fragment>
                      </Table.Tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Table.Tbody>
            )}
          </Droppable>

          <Table.Tfoot>
            <Table.Tr style={{ borderBottom: 'none' }}>
              <Table.Td colSpan={6}>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() =>
                      setProductReviews(prev => [
                        ...prev,
                        productReviews.at(-1)
                          ? { ...productReviews.at(-1)!, id: '' }
                          : {
                              id: '',
                              product_type: product_type,
                              rating: 1,
                              full_name: '',
                              review: '',
                              date: new Date().toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              }),
                            },
                      ])
                    }
                    type="button"
                    disabled={onRequest}
                    color="green"
                  >
                    {onRequest ? 'Wait ...' : 'Create'}
                  </Button>
                  <Button
                    onClick={async () => {
                      const { error: err, data: validatedProductReviews } =
                        zodTypeReviews.safeParse(productReviews)

                      if (err) {
                        console.error(err)
                        alert('Invalid reviews format')
                        return
                      }

                      setOnRequest(true)
                      try {
                        const res = await axios.post(
                          `${envClient.API_ADMIN_URL}/product/product_type/review`,
                          {
                            reviews: validatedProductReviews,
                          }
                        )
                        if (res.status === 200) {
                          window.location.reload()
                        } else {
                          alert(
                            `Error creating updating the reviews: ${
                              res.data?.message || errorUnexpected
                            }`
                          )
                          console.error(res)
                        }
                      } catch (e) {
                        alert('Error creating updating the reviews')
                        console.error(e)
                      }
                      setOnRequest(false)
                    }}
                    type="button"
                    disabled={
                      JSON.stringify(productReviews) ===
                        JSON.stringify(product_reviews) || onRequest
                    }
                    color="green"
                  >
                    {onRequest ? 'Wait ...' : 'Apply changes'}
                  </Button>
                </div>
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </DragDropContext>
    </Table.ScrollContainer>
  )
}
