import { zodImage } from '@/data/zod'

import { Dispatch, SetStateAction, useState } from 'react'
import { Button, FileButton, Image, Modal, Text, Tooltip } from '@mantine/core'
import NextImage from 'next/image'
import { envClient } from '@/env'
import { sanitizeFilename } from '@/utils/sanitize'
import axios from 'axios'
import { errorUnexpected } from '@/data/error'
import { z } from 'zod'
import Link from 'next/link'
import { ROUTE_ADMIN_PRODUCT } from '@/data/routes'
import { useDisclosure } from '@mantine/hooks'

type ProductTypeProps = {
  product_type: string
  imagesMinio: string[]
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

export function ProductType({
  product_type,
  imagesMinio,
  onRequest,
  setOnRequest,
}: ProductTypeProps) {
  const [imagesNew, setImagesNew] = useState(imagesMinio)
  const [imagesNewFiles, setImagesNewFiles] = useState<File[]>([])

  const [modalState, setModalState] = useState('')
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false)

  const [imagesVisible, setImagesVisible] = useState(false)

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalState('')
          closeModal()
        }}
        centered
      >
        <div className="flex flex-col">
          <h1>You are about to delete product_type: {modalState}</h1>
          <h2>Click the delete button to delete.</h2>
          <Button
            onClick={async () => {
              setOnRequest(true)
              try {
                const res = await axios.delete(
                  `${envClient.API_ADMIN_URL}/product/product_type/delete`,
                  {
                    data: {
                      product_type: modalState,
                    },
                  }
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  alert(
                    `Error deleting ${modalState}: ${
                      res.data?.message || errorUnexpected
                    }`
                  )
                  console.error(res)
                }
              } catch (e) {
                alert(`Error deleting ${modalState}`)
                console.error(e)
              }
              setOnRequest(false)
            }}
            type="button"
            disabled={onRequest}
            color="red"
            mt="lg"
            className="mx-auto"
          >
            {onRequest ? 'Wait ...' : 'Delete'}
          </Button>
        </div>
      </Modal>
      <div className="flex flex-col gap-4 h-full p-2 border border-neutral-300 rounded-lg bg-white">
        <div className="flex gap-8">
          <Link
            href={`${ROUTE_ADMIN_PRODUCT}/${product_type}`}
            className="text-2xl hover:text-red-600"
          >
            {product_type}
          </Link>
          <Link
            href={`${ROUTE_ADMIN_PRODUCT}/${product_type}/reviews`}
            className="text-2xl text-green-600 hover:text-red-600"
          >
            reviews
          </Link>
          <Button
            onClick={() => {
              setModalState(product_type)
              openModal()
            }}
            type="button"
            disabled={onRequest}
            color="red"
            className="ml-auto"
          >
            {onRequest ? 'Wait ...' : 'Delete'}
          </Button>
        </div>

        {imagesVisible ? (
          <>
            {' '}
            {imagesNew.map((image, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Tooltip
                  openDelay={1000}
                  label={
                    <div
                      style={{
                        position: 'relative',
                        width: '200px',
                        height: '200px',
                      }}
                    >
                      <Image
                        component={NextImage}
                        unoptimized
                        src={
                          imagesMinio.includes(image)
                            ? `${envClient.API_ADMIN_URL}/product/product_type/image/${product_type}/${image}`
                            : URL.createObjectURL(
                                imagesNewFiles[
                                  imagesNewFiles.findIndex(
                                    file =>
                                      sanitizeFilename(file.name) === image
                                  )
                                ]
                              )
                        }
                        alt={image}
                        fill
                        style={{ objectFit: 'contain', background: 'white' }}
                        priority
                      />
                    </div>
                  }
                  position="top"
                  withArrow
                  arrowSize={8}
                >
                  <Text
                    style={{
                      color: imagesMinio.includes(image) ? 'black' : 'green',
                    }}
                  >
                    {image}
                  </Text>
                </Tooltip>
                <Button
                  onClick={async () => {
                    if (imagesMinio.includes(image)) {
                      setOnRequest(true)
                      try {
                        const res = await axios.delete(
                          `${envClient.API_ADMIN_URL}/product/product_type/image/delete`,
                          {
                            data: { product_type: product_type, image: image },
                          }
                        )
                        if (res.status === 200) {
                          window.location.reload()
                        } else {
                          alert(
                            `Error deleting ${image}: ${
                              res.data?.message || errorUnexpected
                            }`
                          )
                          console.error(res)
                        }
                      } catch (e) {
                        alert(`Error deleting ${image}`)
                        console.error(e)
                      }
                      setOnRequest(false)
                    } else {
                      setImagesNew(prev => prev.filter(b => b !== image))
                      setImagesNewFiles(prev =>
                        prev.filter(f => f.name !== image)
                      )
                    }
                  }}
                  type="button"
                  disabled={onRequest}
                  color="red"
                  className="ml-auto"
                >
                  {onRequest ? 'Wait ...' : 'Delete'}
                </Button>
              </div>
            ))}
          </>
        ) : (
          <Button
            type="button"
            disabled={onRequest}
            onClick={() => setImagesVisible(true)}
            color="green"
            className="mx-auto"
          >
            {onRequest ? 'Wait ...' : 'Δες φωτογραφίες'}
          </Button>
        )}

        <div className="flex justify-center gap-2 w-full mt-auto">
          <FileButton
            onChange={files => {
              const newFiles = files.filter(file => {
                return !imagesMinio.includes(sanitizeFilename(file.name))
              })
              setImagesNew(prev => [
                ...prev,
                ...newFiles.map(file => sanitizeFilename(file.name)),
              ])
              setImagesNewFiles(prev => [...prev, ...newFiles])
            }}
            accept="image/png,image/jpeg"
            multiple
          >
            {props => (
              <Button
                {...props}
                type="button"
                disabled={onRequest}
                color="blue"
              >
                {onRequest ? 'Wait ...' : 'Upload'}
              </Button>
            )}
          </FileButton>
          <Button
            onClick={async () => {
              const { data: validatedProductType } = z
                .string()
                .safeParse(product_type)
              if (!validatedProductType) {
                alert('Invalid brandNew format')
                return
              }

              const { data: validatedImagesNewFiles } =
                zodImage.safeParse(imagesNewFiles)
              if (!validatedImagesNewFiles) {
                alert('Invalid imageNew format')
                return
              }

              const formData = new FormData()
              try {
                formData.append(
                  'product_type',
                  JSON.stringify(validatedProductType)
                )
                validatedImagesNewFiles.forEach(image => {
                  formData.append('imagesNewFiles', image, image.name)
                })
              } catch (e) {
                alert('Error appending to formData')
                console.error(e)
                return
              }

              setOnRequest(true)
              try {
                const res = await axios.post(
                  `${envClient.API_ADMIN_URL}/product/product_type/image/post`,
                  formData,
                  {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  }
                )
                if (res.status === 200) {
                  window.location.reload()
                } else {
                  alert(
                    `Error creating brands: ${
                      res.data?.message || errorUnexpected
                    }`
                  )
                  console.error(res)
                }
              } catch (e) {
                alert('Error creating brands')
                console.error(e)
              }
              setOnRequest(false)
            }}
            type="button"
            disabled={
              JSON.stringify(imagesNew) === JSON.stringify(imagesMinio) ||
              onRequest
            }
            color="green"
          >
            {onRequest ? 'Wait ...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </>
  )
}
