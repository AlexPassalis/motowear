import { useContext } from '@/app/admin/product/client/context/useContext'
import axios from 'axios'

export function NewProductType() {
  const {
    newProductTypeRef,
    productNew,
    setProductNew,
    onRequest,
    setOnRequest,
  } = useContext()

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        const newProductType = newProductTypeRef.current?.value ?? ''
        if (!newProductType) {
          alert('Invalid New Type input')
          return
        }
        if (newProductType in productNew) {
          alert(`Type "${newProductType}" already exists.`)
          return
        }

        setOnRequest(true)
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL_CLIENT}/api/admin/product/type`,
            { newProductType: newProductType }
          )
          if (res.status === 200) {
            window.location.reload()
          } else {
            alert(`Error creating New Type: ${res.data.message}`)
            console.error(res)
          }
        } catch (e) {
          alert('Error creating New Type')
          console.error(e)
        }
        if (newProductTypeRef.current) {
          newProductTypeRef.current.value = ''
        }
        setOnRequest(false)
      }}
      className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg bg-white"
    >
      <label htmlFor="newProductType" className="text-lg">
        New Type
      </label>
      <input
        id="newProductType"
        type="text"
        ref={newProductTypeRef}
        className="text-center border rounded-lg w-full flex-1"
      />
      <button
        type="submit"
        disabled={onRequest}
        className={`self-center px-2 py-1 border rounded-lg text-sm ${
          onRequest
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-green-700 hover:text-white hover:cursor-pointer'
        }`}
      >
        {onRequest ? 'Wait ...' : 'Create'}
      </button>
    </form>
  )
}
