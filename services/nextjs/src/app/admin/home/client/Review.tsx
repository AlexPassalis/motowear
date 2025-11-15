import type { typeHomePage } from '@/utils/getPostgres'
import type { typeHomePageReview } from '@/lib/postgres/data/type'

import { Button, NumberInput, Table, TextInput } from '@mantine/core'
import { Dispatch, memo, SetStateAction } from 'react'
import { DateInput } from '@mantine/dates'
import axios from 'axios'
import { envClient } from '@/envClient'
import { ERROR } from '@/data/magic'

export const Review = memo(reviewNotMemoised)

type reviewProps = {
  index: number
  reviewsState: typeHomePageReview[]
  home_page: typeHomePage
  setHomePage: Dispatch<SetStateAction<typeHomePage>>
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

function reviewNotMemoised({
  index,
  reviewsState,
  home_page,
  setHomePage,
  onRequest,
  setOnRequest,
}: reviewProps) {
  return (
    <>
      <Table.Td style={{ textAlign: 'center' }}>
        <NumberInput
          value={reviewsState[index]?.rating}
          onChange={(value) =>
            setHomePage((prev) => ({
              ...prev,
              reviews: prev.reviews.map((r, i) =>
                i === index ? { ...r, rating: Number(value) ?? r.rating } : r,
              ),
            }))
          }
          min={1}
          max={5}
          disabled={onRequest}
        />
      </Table.Td>

      <Table.Td>
        <TextInput
          defaultValue={reviewsState[index]?.full_name}
          onBlur={(e) =>
            setHomePage((prev) => ({
              ...prev,
              reviews: prev.reviews.map((r, i) =>
                i === index ? { ...r, full_name: e.target.value } : r,
              ),
            }))
          }
          placeholder="Φίλιππος Χατζηκαντής"
        />
      </Table.Td>

      <Table.Td>
        <TextInput
          defaultValue={reviewsState[index]?.review}
          onBlur={(e) =>
            setHomePage((prev) => ({
              ...prev,
              reviews: prev.reviews.map((r, i) =>
                i === index ? { ...r, review: e.target.value } : r,
              ),
            }))
          }
          placeholder="Αγόρασε το crypton-x μπλουζάκι και θα αλλάξει η ζωή σου (προς το χειρότερο)."
        />
      </Table.Td>

      <Table.Td>
        <DateInput
          placeholder="Επίλεξε μέρα"
          defaultValue={
            reviewsState[index]?.date
              ? new Date(reviewsState[index]?.date)
              : new Date()
          }
          onBlur={(e) =>
            setHomePage((prev) => ({
              ...prev,
              reviews: prev.reviews.map((r, i) =>
                i === index ? { ...r, date: e.target.value } : r,
              ),
            }))
          }
        />
      </Table.Td>

      <Table.Td className="text-center">
        <Button
          onClick={async () => {
            if (home_page.reviews.includes(reviewsState[index])) {
              setOnRequest(true)
              try {
                const res = await axios.delete(
                  `${envClient.API_ADMIN_URL}/pages/home/review`,
                  {
                    data: {
                      review_id: reviewsState[index].id,
                    },
                  },
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  alert(
                    `Error deleting review ${reviewsState[index].review}: ${
                      res.data?.message || ERROR.unexpected
                    }`,
                  )
                  console.error(res)
                }
              } catch (err) {
                alert(`Error deleting review`)
                console.error(err)
              }
              setOnRequest(false)
            } else {
              setHomePage((prev) => ({
                ...prev,
                reviews: prev.reviews.filter((_, i) => i !== index),
              }))
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
