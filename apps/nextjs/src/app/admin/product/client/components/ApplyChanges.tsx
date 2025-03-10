import { useContext } from '@/app/admin/product/client/context/useContext'
import { typeProduct, typeImage } from '@/data/zod/type'
import axios from 'axios'

export function ApplyChanges() {
  const { setOnRequest, imageNew, productNew, onRequest, productPostgres } =
    useContext()

  return Object.keys(productNew).length === 0 ? null : (
    <button
      onClick={async () => {
        const { data: validatedProductNew } = typeProduct.safeParse(productNew)
        if (!validatedProductNew) {
          alert('Invalid productNew format')
          return
        }

        const { data: validatedImageNew } = typeImage.safeParse(imageNew)
        if (!validatedImageNew) {
          alert('Invalid imageNew format')
          return
        }

        setOnRequest(true)
        const formData = new FormData()
        try {
          validatedImageNew.forEach(image => {
            formData.append('imageNew', image, image.name)
          })
          formData.append('productNew', JSON.stringify(validatedProductNew))
        } catch (e) {
          alert('Error appending to formData')
          console.error(e)
          return
        }

        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL_CLIENT}/api/admin/product/type/version/post`,
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
            }
          )
          if (res.status === 200) {
            window.location.reload()
          } else {
            alert(`Error creating New Versions: ${res.data.message}`)
            console.error(res)
          }
        } catch (e) {
          alert('Error creating New Versions')
          console.error(e)
        }
        setOnRequest(false)
      }}
      type="button"
      disabled={onRequest || productNew === productPostgres}
      className={`${
        productNew === productPostgres ? 'hidden' : null
      } self-center px-2 py-1 border rounded-lg text-sm text-center ${
        onRequest || productNew === productPostgres
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-green-700 hover:text-white hover:cursor-pointer'
      }`}
    >
      {onRequest ? 'Wait ...' : 'Apply Changes'}
    </button>
  )
}
