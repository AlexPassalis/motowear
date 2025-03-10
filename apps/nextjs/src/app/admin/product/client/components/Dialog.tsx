import { useContext } from '@/app/admin/product/client/context/useContext'
import axios from 'axios'

export function Dialog() {
  const {
    dialogRef,
    deleteProductType,
    productNew,
    setProductNew,
    onRequest,
    setOnRequest,
    closeDialog,
  } = useContext()

  return (
    <dialog
      ref={dialogRef}
      className="top-1/2 left-1/2 transform -translate-1/2 border rounded-lg border-neutral-300 bg-white px-4 py-2"
    >
      <p className="items-center m-2">
        You are about to delete product type{' '}
        <span className="font-bold text-lg">{deleteProductType}</span>.
      </p>
      <div className="flex justify-center gap-2">
        <button
          onClick={async () => {
            if (!(deleteProductType in productNew)) {
              alert(
                `Product type "${deleteProductType}" does not exist, so you cannot delete it.`
              )
              return
            }

            setOnRequest(true)
            try {
              const res = await axios.delete(
                `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL_CLIENT}/api/admin/product/type`,
                { data: { deleteProductType } }
              )

              if (res.status === 200) {
                setProductNew(prev => {
                  const updatedProduct = { ...prev }
                  delete updatedProduct[deleteProductType]
                  return updatedProduct
                })
                closeDialog()
              } else {
                console.error(res)
              }
            } catch (e) {
              console.error('Error deleting product type:', e)
            }
            setOnRequest(false)
          }}
          type="button"
          disabled={onRequest}
          className={`px-2 py-1 border rounded-lg text-sm ${
            onRequest
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-red-700 hover:text-white hover:cursor-pointer'
          }`}
        >
          {onRequest ? 'Wait ...' : 'DELETE'}
        </button>

        <button
          onClick={() => closeDialog()}
          type="button"
          disabled={onRequest}
          className={`px-2 py-1 border rounded-lg text-sm ${
            onRequest
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-700 hover:text-white hover:cursor-pointer'
          }`}
        >
          {onRequest ? 'Wait ...' : 'DO NOT DELETE'}
        </button>
      </div>
    </dialog>
  )
}
