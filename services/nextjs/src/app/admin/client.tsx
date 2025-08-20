'use client'

import type { typeOrder } from '@/lib/postgres/data/type'
import type {
  typeCoupons,
  typeDailySessions,
  typeShipping,
} from '@/utils/getPostgres'

import axios from 'axios'
import { LineChart } from '@mantine/charts'
import { useEffect, useState } from 'react'
import { DatePickerInput } from '@mantine/dates'
import { addDays, startOfDay } from 'date-fns'
import { toZonedTime, format } from 'date-fns-tz'
import { Button, NumberInput, TextInput } from '@mantine/core'
import { envClient } from '@/env'
import { errorUnexpected } from '@/data/error'
import { zodCoupons, zodShipping } from '@/lib/postgres/data/zod'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

type AdminPageClientProps = {
  orders: typeOrder[]
  daily_sessions: typeDailySessions
  shippingPostgres: typeShipping
  postgres_coupons: typeCoupons
}

type typeData = {
  date: string
  revenue: number
  orders: number
  sessions: number
  conversion: number
}[]

export function AdminPageClient({
  orders,
  daily_sessions,
  shippingPostgres,
  postgres_coupons,
}: AdminPageClientProps) {
  const [onRequest, setOnRequest] = useState(false)

  const timezone = 'Europe/Athens'
  const todayAthens = startOfDay(toZonedTime(new Date(), timezone))
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    todayAthens,
    addDays(todayAthens, 1),
  ])

  const [visibleData, setVisibleData] = useState<typeData>([])

  useEffect(() => {
    if (!dateRange[0] || !dateRange[1]) {
      setVisibleData([])
      return
    }

    const startAthens = startOfDay(toZonedTime(dateRange[0], timezone))
    const endAthens = startOfDay(toZonedTime(dateRange[1], timezone))

    const data: typeData = []

    orders.forEach((order) => {
      const orderDate = toZonedTime(order.order_date, timezone)
      if (orderDate >= startAthens && orderDate < endAthens) {
        const date = format(orderDate, 'yyyy-MM-dd', { timeZone: timezone })
        const existingEntry = data.find((item) => item.date === date)
        if (existingEntry) {
          existingEntry.revenue = Number(
            (existingEntry.revenue + order.total).toFixed(2),
          )
          existingEntry.orders++
          existingEntry.sessions = 0
          existingEntry.conversion = 0
        } else {
          data.push({
            date: date,
            revenue: Number(order.total.toFixed(2)),
            orders: 1,
            sessions: 0,
            conversion: 0,
          })
        }
      }
    })

    daily_sessions.forEach((day) => {
      const dayDate = toZonedTime(new Date(day.date), timezone)

      if (dayDate >= startAthens && dayDate < endAthens) {
        const existingEntry = data.find(
          (item) =>
            item.date === format(dayDate, 'yyyy-MM-dd', { timeZone: timezone }),
        )
        if (existingEntry) {
          existingEntry.sessions = day.sessions || 0
          existingEntry.conversion =
            day.sessions > 0
              ? Number(((existingEntry.orders / day.sessions) * 100).toFixed(2))
              : 0
        } else {
          data.push({
            date: format(dayDate, 'yyyy-MM-dd', { timeZone: timezone }),
            revenue: 0,
            orders: 0,
            sessions: day.sessions,
            conversion: 0,
          })
        }
      }
    })

    data.sort((a, b) => a.date.localeCompare(b.date))
    setVisibleData(data)
  }, [orders, daily_sessions, dateRange])

  const [shipping, setShipping] = useState(shippingPostgres)
  const [coupons, setCoupons] = useState(postgres_coupons)

  return (
    <AdminProvider>
      <div className="relative border-2 border-[var(--mantine-border)] rounded-lg bg-white p-2 m-4">
        <h1 className="text-center text-2xl mb-2">Metrics</h1>
        <div className="flex justify-evenly items-center gap-4 mb-4">
          <div className="items-center">
            <h1 className="text-lg">Revenew (€)</h1>
            <h2>
              {visibleData.length > 0
                ? visibleData
                    .reduce((acc, item) => acc + item.revenue, 0)
                    .toFixed(2)
                : 0}
            </h2>
          </div>
          <div>
            <h1 className="text-lg">Orders</h1>
            <h2>
              {visibleData.length > 0
                ? visibleData.reduce((acc, item) => acc + item.orders, 0)
                : 0}
            </h2>
          </div>
          <div>
            <h1 className="text-lg">Sessions</h1>
            <h2>
              {visibleData.length > 0
                ? visibleData.reduce((acc, item) => acc + item.sessions, 0)
                : 0}
            </h2>
          </div>
          <div>
            <h1 className="text-lg">Conversion (%)</h1>
            <h2>
              {visibleData.length > 0
                ? (
                    visibleData.reduce(
                      (acc, item) => acc + item.conversion,
                      0,
                    ) / visibleData.length
                  ).toFixed(2)
                : 0}
            </h2>
          </div>
          <DatePickerInput
            type="range"
            valueFormat="DD MMM YYYY"
            placeholder="Pick dates range"
            value={dateRange}
            onChange={(value) => setDateRange(value)}
          />
        </div>
        <LineChart
          curveType="natural"
          h={300}
          data={visibleData}
          dataKey="date"
          series={[
            { name: 'revenue', color: 'green' },
            { name: 'orders', color: 'blue' },
            { name: 'sessions', color: 'black' },
            { name: 'conversion', color: 'orange' },
          ]}
          tickLine="none"
          gridAxis="xy"
          tooltipAnimationDuration={100}
          withDots={false}
        />
      </div>

      <div className="flex flex-col justify-center items-center gap-2 border-2 border-[var(--mantine-border)] rounded-lg bg-white p-2 m-4">
        <h1 className="text-center text-2xl">Shipping</h1>
        <div className="flex gap-2 items-end">
          <NumberInput
            value={shipping.expense_elta_courier ?? ''}
            onChange={(value) => {
              if (typeof value === 'number') {
                setShipping((prev) => ({
                  ...prev,
                  expense_elta_courier: value,
                }))
              } else {
                setShipping((prev) => ({ ...prev, expense_elta_courier: null }))
              }
            }}
            label="Expense Elta Courier"
            min={0}
            max={9999.99}
            suffix="€"
            disabled={onRequest}
          />
          <NumberInput
            value={shipping.expense_box_now ?? ''}
            onChange={(value) => {
              if (typeof value === 'number') {
                setShipping((prev) => ({ ...prev, expense_box_now: value }))
              } else {
                setShipping((prev) => ({ ...prev, expense_box_now: null }))
              }
            }}
            label="Expense BOX NOW"
            min={0}
            max={9999.99}
            suffix="€"
            disabled={onRequest}
          />
          <NumberInput
            value={shipping.free ?? ''}
            onChange={(value) => {
              if (typeof value === 'number') {
                setShipping((prev) => ({ ...prev, free: value }))
              } else {
                setShipping((prev) => ({ ...prev, free: null }))
              }
            }}
            label="Free"
            min={0}
            max={9999.99}
            suffix="€"
            disabled={onRequest}
          />
          <NumberInput
            value={shipping.surcharge ?? ''}
            onChange={(value) => {
              if (typeof value === 'number') {
                setShipping((prev) => ({ ...prev, surcharge: value }))
              } else {
                setShipping((prev) => ({ ...prev, surcharge: null }))
              }
            }}
            label="Surcharge"
            min={0}
            max={9999.99}
            suffix="€"
            disabled={onRequest}
          />
          <Button
            onClick={async () => {
              const { error, data: validatedShipping } =
                zodShipping.safeParse(shipping)

              if (error) {
                alert('Invalid shipping format')
                return
              }

              setOnRequest(true)
              try {
                const res = await axios.post(
                  `${envClient.API_ADMIN_URL}/other/shipping`,
                  {
                    shipping: validatedShipping,
                  },
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  alert(
                    `Error creating New Versions: ${
                      res.data?.message || errorUnexpected
                    }`,
                  )
                  console.error(res)
                }
              } catch (err) {
                alert('Error creating New Versions')
                console.error(err)
              }
              setOnRequest(false)
            }}
            type="button"
            disabled={
              JSON.stringify(shippingPostgres) === JSON.stringify(shipping) ||
              onRequest
            }
            color="green"
          >
            {onRequest ? 'Wait ...' : 'Apply changes'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center gap-2 border-2 border-[var(--mantine-border)] rounded-lg bg-white p-2 m-4">
        <h2 className="text-center text-2xl">Coupons</h2>

        {coupons.length > 0 ? (
          coupons.map((coupon, index) => (
            <div key={index} className="flex gap-2 items-end">
              <TextInput
                value={coupon.coupon_code}
                onChange={(e) =>
                  setCoupons((prev) =>
                    prev.map((coupon, i) =>
                      i === index
                        ? { ...coupon, coupon_code: e.target.value }
                        : coupon,
                    ),
                  )
                }
                label="coupon_code"
              />
              <NumberInput
                value={coupon.percentage ? coupon.percentage * 100 : ''}
                onChange={(value) =>
                  setCoupons((prev) =>
                    prev.map((coupon, i) =>
                      i === index
                        ? {
                            ...coupon,
                            percentage: value ? Number(value) / 100 : null,
                          }
                        : coupon,
                    ),
                  )
                }
                label="percentage"
                suffix="%"
              />
              <NumberInput
                value={coupon.fixed ? coupon.fixed : ''}
                onChange={(value) =>
                  setCoupons((prev) =>
                    prev.map((coupon, i) =>
                      i === index
                        ? {
                            ...coupon,
                            fixed: value ? Number(value) : null,
                          }
                        : coupon,
                    ),
                  )
                }
                allowNegative
                label="fixed"
                suffix="€"
              />

              <Button
                type="button"
                onClick={async () => {
                  setOnRequest(true)
                  try {
                    const res = await axios.delete(
                      `${envClient.API_ADMIN_URL}/order/coupon/delete`,
                      {
                        data: { coupon_code: coupon.coupon_code },
                      },
                    )
                    if (res.status === 200) {
                      window.location.reload()
                    } else {
                      alert(
                        `Error deleting coupon: ${
                          res.data?.message || errorUnexpected
                        }`,
                      )
                      console.error(res)
                    }
                  } catch (err) {
                    alert('Error deleting coupon')
                    console.error(err)
                  }
                  setOnRequest(false)
                }}
                disabled={onRequest}
                color="red"
                className="ml-auto"
                style={{ whiteSpace: 'normal' }}
              >
                {onRequest ? 'Wait ...' : 'Delete'}
              </Button>
            </div>
          ))
        ) : (
          <p className="text-red-500">
            You have not created any coupon&apos;s yet.
          </p>
        )}
        <div className="flex gap-2 items-center">
          <Button
            onClick={() =>
              setCoupons((prev) => [
                ...prev,
                { coupon_code: '', percentage: null, fixed: null },
              ])
            }
            type="button"
            disabled={onRequest}
            color="green"
            className="m-1 mx-auto"
          >
            {onRequest ? 'Wait ...' : 'Create'}
          </Button>
          <Button
            onClick={async () => {
              const { error, data: validatedCoupons } =
                zodCoupons.safeParse(coupons)

              if (error) {
                alert('Invalid coupons format')
                return
              }

              setOnRequest(true)
              try {
                const res = await axios.post(
                  `${envClient.API_ADMIN_URL}/order/coupon`,
                  {
                    coupons: validatedCoupons,
                  },
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  alert(
                    `Error creating New coupons: ${
                      res.data?.message || errorUnexpected
                    }`,
                  )
                  console.error(res)
                }
              } catch (err) {
                alert('Error creating New coupons')
                console.error(err)
              }
              setOnRequest(false)
            }}
            type="button"
            disabled={
              JSON.stringify(postgres_coupons) === JSON.stringify(coupons) ||
              onRequest
            }
            color="green"
          >
            {onRequest ? 'Wait ...' : 'Apply changes'}
          </Button>
        </div>
      </div>
    </AdminProvider>
  )
}
