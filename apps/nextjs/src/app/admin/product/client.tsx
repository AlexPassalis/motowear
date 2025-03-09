'use client'

import React, {
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  RefObject,
} from 'react'
import axios from 'axios'
import { ProductVersion, Product } from '@/data/types'
import { z } from 'zod'
import Dropzone from 'react-dropzone'

export const typeProduct = z.array(
  z.record(
    z.array(
      z.object({
        id: z.string(),
        version: z.string(),
        images: z.array(z.string()),
      })
    )
  )
)

type ConfigClientPageProps = {
  productPostgres: Product
}

export function AdminProductClientPage({
  productPostgres,
}: ConfigClientPageProps) {
  const [productNew, setProductNew] = useState(productPostgres)
  const [imageNew, setImageNew] = useState<File[]>([])

  const dialogRef = useRef<null | HTMLDialogElement>(null)
  const [deleteProductType, setDeleteProductType] = useState('')
  const newProductTypeRef = useRef<null | HTMLInputElement>(null)
  const [onRequest, setOnRequest] = useState(false)

  // console.log('This is the product: ', product)
  console.log('This is the productNew: ', productNew)
  console.log('This is the imageNew: ', imageNew)

  function openModal() {
    dialogRef.current?.showModal()
  }

  function closeModal() {
    dialogRef.current?.close()
  }

  return (
    <>
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
              const currentProductTypes = productNew.map(
                table => Object.keys(table)[0]
              )
              if (!currentProductTypes.includes(deleteProductType)) {
                alert(
                  `Product type ${deleteProductType} does not exist, so you cannot delete it.`
                )
                return
              }

              setOnRequest(true)
              try {
                const res = await axios.delete(
                  `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL_CLIENT}/api/admin/product/type`,
                  { data: { deleteProductType: deleteProductType } }
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  console.error(res)
                }
              } catch (e) {
                console.error('Error uploading files:', e)
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
            onClick={() => closeModal()}
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

      <div className="flex flex-col justify-center items-center h-screen gap-2 text-black">
        {productNew.map(table => {
          const type = Object.keys(table)[0]
          return (
            <div
              key={type}
              onSubmit={async e => {
                e.preventDefault()
                setOnRequest(true)
                const newProductTypeSubmitted = newProductTypeRef.current?.value

                try {
                  const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL_CLIENT}/api/admin/config/product`,
                    { newProductType: newProductTypeSubmitted }
                  )
                  if (res.status === 200) {
                    window.location.reload()
                  } else {
                    console.error(res)
                  }
                } catch (e) {
                  console.error('Error uploading files:', e)
                }

                setOnRequest(false)
              }}
              className="flex flex-col gap-2 border border-neutral-300 rounded-lg bg-white px-4 py-2"
            >
              <div className="flex justify-end items-center min-w-64">
                <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl">
                  {type}
                </h1>
                <button
                  onClick={() => {
                    setDeleteProductType(type)
                    openModal()
                  }}
                  type="button"
                  disabled={onRequest}
                  className={`px-2 py-1 border rounded-lg text-sm ${
                    onRequest
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-red-700 hover:text-white hover:cursor-pointer'
                  }`}
                >
                  {onRequest ? 'Wait ...' : 'Delete'}
                </button>
              </div>

              {table[type].map((productRow: ProductVersion, index) => {
                return (
                  <div key={productRow.id} className="flex gap-2">
                    <div>
                      <h2 className="text-center text-xl">id</h2>
                      <p>{productRow.id}</p>
                    </div>
                    <div>
                      <h2 className="text-center text-xl">version</h2>
                      <input
                        value={productRow.version}
                        onChange={e => {
                          setProductNew(prev =>
                            prev.map(obj => {
                              const k = Object.keys(obj)[0]
                              if (k === type) {
                                return {
                                  [k]: obj[k].map(row =>
                                    row.id === productRow.id
                                      ? { ...row, version: e.target.value }
                                      : row
                                  ),
                                }
                              }
                              return obj
                            })
                          )
                        }}
                        className="text-center border rounded-lg"
                      />
                    </div>
                    <div>
                      <h2 className="text-center text-xl">images</h2>
                      {productRow.images.map(image => {
                        return <p key={`${productRow.id}-${image}`}>{image}</p>
                      })}
                    </div>
                    <div>
                      <Dropzone
                        onDrop={function (acceptedFiles) {
                          setProductNew(prev => {
                            return prev.map(obj => {
                              const k = Object.keys(obj)[0]
                              if (k === type) {
                                return {
                                  [k]: obj[k].map((row, i) => {
                                    if (i === index) {
                                      const oldFilenames = row.images || []
                                      const newFilenames = acceptedFiles.map(
                                        f => f.name
                                      )
                                      return {
                                        ...row,
                                        images: [
                                          ...oldFilenames,
                                          ...newFilenames,
                                        ],
                                      }
                                    }
                                    return row
                                  }),
                                }
                              }
                              return obj
                            })
                          })
                          setImageNew(prev => [...prev, ...acceptedFiles])
                        }}
                      >
                        {function (renderProps) {
                          const getRootProps = renderProps.getRootProps
                          const getInputProps = renderProps.getInputProps
                          return (
                            <section className="self-center px-2 py-1 border border-dashed rounded-lg text-sm text-center">
                              <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <span>
                                  Drop or click to select <br /> images to
                                  upload.
                                </span>
                              </div>
                            </section>
                          )
                        }}
                      </Dropzone>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={() => {
                  const newVersion = {
                    id: '',
                    version: '',
                    images: [],
                  }

                  const updatedProduct = productNew.map(obj => {
                    const key = Object.keys(obj)[0]
                    if (key === type) {
                      return {
                        [key]: [...obj[key], newVersion],
                      }
                    }
                    return obj
                  })
                  setProductNew(updatedProduct)
                }}
                type="button"
                disabled={onRequest}
                className={`self-center px-2 py-1 border rounded-lg text-sm text-center ${
                  onRequest
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-green-700 hover:text-white hover:cursor-pointer'
                }`}
              >
                {onRequest ? 'Wait ...' : 'Create'}
              </button>
            </div>
          )
        })}

        <NewProductTypeForm
          newProductTypeRef={newProductTypeRef}
          onRequest={onRequest}
          setOnRequest={setOnRequest}
        />

        <button
          onClick={async () => {
            // const { data: validatedProductNew } =
            //   typeProduct.safeParse(productNew)

            // if (!validatedProductNew) {
            //   alert('productNew invalid input')
            //   return
            // }

            setOnRequest(true)

            let formData
            try {
              formData = new FormData()
              imageNew.forEach(image => {
                formData.append('imageNew', image, image.name)
              })
              formData.append('productNew', JSON.stringify(productNew))
            } catch (e) {
              console.log(e)
            }

            try {
              const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL_CLIENT}/api/admin/product/type/version`,
                formData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }
              )
              if (res.status === 200) {
                console.log(res)
                // window.location.reload()
              } else {
                alert('Error creating New Versions')
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
          className={`self-center px-2 py-1 border rounded-lg text-sm text-center ${
            onRequest || productNew === productPostgres
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-700 hover:text-white hover:cursor-pointer'
          }`}
        >
          {onRequest ? 'Wait ...' : 'Apply Changes'}
        </button>
      </div>
    </>
  )
}

type NewProductFormProps = {
  newProductTypeRef: RefObject<null | HTMLInputElement>
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

function NewProductTypeForm({
  newProductTypeRef,
  onRequest,
  setOnRequest,
}: NewProductFormProps) {
  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!newProductTypeRef.current?.value) {
          alert('New Type invalid input')
          return
        }

        setOnRequest(true)
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL_CLIENT}/api/admin/product/type`,
            { newProductType: newProductTypeRef.current.value }
          )
          if (res.status === 200) {
            newProductTypeRef.current.value = ''
            window.location.reload()
          } else {
            newProductTypeRef.current.value = ''
            alert('Error creating New Type')
            console.error(res)
          }
        } catch (e) {
          newProductTypeRef.current.value = ''
          alert('Error creating New Type')
          console.error(e)
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
        className="border rounded-lg w-full flex-1"
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
