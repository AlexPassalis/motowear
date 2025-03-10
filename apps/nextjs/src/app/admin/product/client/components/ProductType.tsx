import { useContext } from '@/app/admin/product/client/context/useContext'
import { colorPalette } from '@/data/colorPalette'
import { sanitizeFilename } from '@/utils/sanitizeFilename'
import axios from 'axios'
import Dropzone from 'react-dropzone'

export function ProductType() {
  const {
    productNew,
    onRequest,
    setOnRequest,
    newProductTypeRef,
    setDeleteProductType,
    openDialog,
    setProductNew,
    setImageNew,
  } = useContext()

  return (
    <>
      {Object.entries(productNew).map(([key, value], index) => {
        return (
          <div
            key={key}
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
                {key}
              </h1>
              <button
                onClick={() => {
                  setDeleteProductType(key)
                  openDialog()
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

            {value.map((productRow, index) => {
              return (
                <div key={productRow.id} className="flex gap-2">
                  <div>
                    {index === 0 ? (
                      <h2 className="text-center text-xl">id</h2>
                    ) : null}
                    <p>{productRow.id}</p>
                  </div>
                  <div className="flex flex-col">
                    {index === 0 ? (
                      <label
                        htmlFor={`${productRow.id}-${productRow.version}`}
                        className="text-center text-xl"
                      >
                        version
                      </label>
                    ) : null}
                    <input
                      id={`${productRow.id}-${productRow.version}`}
                      value={productRow.version}
                      onChange={e => {
                        setProductNew(prev => ({
                          ...prev,
                          [key]: prev[key].map((row, i) =>
                            i === index
                              ? { ...row, version: e.target.value }
                              : row
                          ),
                        }))
                      }}
                      className="text-center border rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col">
                    {index === 0 ? (
                      <label
                        htmlFor={`${productRow.id}-${productRow.version}-${productRow.color}`}
                        className="text-center text-xl"
                      >
                        color
                      </label>
                    ) : null}
                    <select
                      id={`${productRow.id}-${productRow.version}-${productRow.color}`}
                      value={productRow.color}
                      onChange={e => {
                        setProductNew(prev => ({
                          ...prev,
                          [key]: prev[key].map((row, i) =>
                            i === index
                              ? { ...row, color: e.target.value }
                              : row
                          ),
                        }))
                      }}
                      className="text-center border rounded-lg"
                    >
                      {colorPalette.map(color => {
                        return (
                          <option
                            key={`${productRow.id}-${productRow.version}-${color}`}
                            value={color}
                          >
                            {color}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    {index === 0 ? (
                      <h2 className="text-center text-xl">images</h2>
                    ) : null}
                    {productRow.images.map(image => {
                      return <p key={`${productRow.id}-${image}`}>{image}</p>
                    })}
                  </div>
                  <div>
                    <Dropzone
                      onDrop={acceptedFiles => {
                        setProductNew(prev => ({
                          ...prev,
                          [key]: prev[key].map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  images: [
                                    ...row.images,
                                    ...acceptedFiles.map(f =>
                                      sanitizeFilename(f.name)
                                    ),
                                  ],
                                }
                              : row
                          ),
                        }))
                        setImageNew(prev => [...prev, ...acceptedFiles])
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section className="self-center px-2 py-1 border border-dashed rounded-lg text-sm text-center">
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <span>
                              Drop or click to select <br /> images to upload.
                            </span>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  </div>
                  <div>
                    <button
                      onClick={async () => {
                        setOnRequest(true)
                        try {
                          const res = await axios.delete(
                            `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL_CLIENT}/api/admin/product/type/version/delete`,
                            {
                              data: {
                                productType: key,
                                id: productRow.id,
                              },
                            }
                          )
                          if (res.status === 200) {
                            window.location.reload()
                          } else {
                            alert(
                              `Error creating New Type: ${res.data.message}`
                            )
                            console.error(res)
                          }
                        } catch (e) {
                          alert('Error creating New Type')
                          console.error(e)
                        }
                        setOnRequest(false)
                      }}
                      type="button"
                      disabled={onRequest}
                      className={`self-center px-2 py-1 border rounded-lg text-sm text-center ${
                        onRequest
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-red-700 hover:text-white hover:cursor-pointer'
                      }`}
                    >
                      {onRequest ? 'Wait ...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              onClick={() => {
                setProductNew(prev => ({
                  ...prev,
                  [key]: [
                    ...prev[key],
                    {
                      id: '-',
                      version: '',
                      color: 'black',
                      images: [],
                    },
                  ],
                }))
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
    </>
  )
}
