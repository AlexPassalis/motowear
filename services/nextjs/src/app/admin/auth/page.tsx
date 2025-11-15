'use client'

import { ROUTE_ADMIN } from '@/data/routes'
import { authClient } from '@/lib/better-auth/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminAuthPage() {
  const router = useRouter()
  const [onRequest, setOnRequest] = useState(false)

  return (
    <div className="flex items-center justify-center h-screen text-black">
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const emailSubmitted = e.currentTarget.email.value
          const passwordSubmitted = e.currentTarget.password.value

          await authClient.signIn.email(
            { email: emailSubmitted, password: passwordSubmitted },
            {
              onRequest: () => {
                setOnRequest(true)
              },
              onError: (response) => {
                setOnRequest(false)
                alert('Try again ...')
                console.error(response)
              },
              onSuccess: () => {
                setOnRequest(false)
                router.push(ROUTE_ADMIN)
                return
              },
            },
          )
        }}
        className="flex flex-col border border-neutral-300 rounded-lg bg-white px-4 py-2"
      >
        <label htmlFor="email" className="text-lg">
          Email
        </label>
        <input
          id="email"
          type="text"
          className="mb-2 border rounded-lg text-center"
        ></input>
        <label htmlFor="password" className="text-lg">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="mb-4 border rounded-lg text-center"
        ></input>
        <button
          type="submit"
          disabled={onRequest}
          className={`self-center w-1/2 border rounded-lg text-center ${
            onRequest
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-700 hover:text-white hover:cursor-pointer'
          }`}
        >
          {onRequest ? 'Wait ...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
