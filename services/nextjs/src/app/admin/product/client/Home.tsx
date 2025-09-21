import { errorUnexpected } from '@/data/error'
import { ROUTE_ADMIN_HOME } from '@/data/routes'
import { zodImage } from '@/data/zod'
import { envClient } from '@/envClient'
import { sanitizeFilename } from '@/utils/sanitize'
import { Button, FileButton, Image, Text, Tooltip } from '@mantine/core'
import axios from 'axios'
import NextImage from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'

type HomeProps = {
  imagesHomePageMinio: string[]
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

export function Home({
  imagesHomePageMinio,
  onRequest,
  setOnRequest,
}: HomeProps) {
  const [imagesNew, setImagesNew] = useState(imagesHomePageMinio)
  const [imagesNewFiles, setImagesNewFiles] = useState<File[]>([])
  const [imagesVisible, setImagesVisible] = useState(false)

  return (
    <div className="flex flex-col h-full gap-2 p-2 border border-neutral-300 rounded-lg bg-white">
      <Link
        href={ROUTE_ADMIN_HOME}
        className="text-center text-2xl hover:text-red-500"
      >
        Home
      </Link>
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
                        imagesHomePageMinio.includes(image)
                          ? `${envClient.API_ADMIN_URL}/pages/home/image/${image}`
                          : URL.createObjectURL(
                              imagesNewFiles[
                                imagesNewFiles.findIndex(
                                  (file) =>
                                    sanitizeFilename(file.name) === image,
                                )
                              ],
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
                    color: imagesHomePageMinio.includes(image)
                      ? 'black'
                      : 'green',
                  }}
                >
                  {image}
                </Text>
              </Tooltip>
              <Button
                onClick={async () => {
                  if (imagesHomePageMinio.includes(image)) {
                    setOnRequest(true)
                    try {
                      const res = await axios.delete(
                        `${envClient.API_ADMIN_URL}/pages/home/image/delete`,
                        {
                          data: { image: image },
                        },
                      )
                      if (res.status === 200) {
                        window.location.reload()
                      } else {
                        alert(
                          `Error deleting ${image}: ${
                            res.data?.message || errorUnexpected
                          }`,
                        )
                        console.error(res)
                      }
                    } catch (err) {
                      alert(`Error deleting ${image}`)
                      console.error(err)
                    }
                    setOnRequest(false)
                  } else {
                    setImagesNew((prev) => prev.filter((b) => b !== image))
                    setImagesNewFiles((prev) =>
                      prev.filter((f) => f.name !== image),
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
          onChange={(files) => {
            const newFiles = files.filter((file) => {
              return !imagesHomePageMinio.includes(sanitizeFilename(file.name))
            })
            setImagesNew((prev) => [
              ...prev,
              ...newFiles.map((file) => sanitizeFilename(file.name)),
            ])
            setImagesNewFiles((prev) => [...prev, ...newFiles])
          }}
          accept="image/png,image/jpeg"
          multiple
        >
          {(props) => (
            <Button {...props} type="button" disabled={onRequest} color="blue">
              {onRequest ? 'Wait ...' : 'Upload'}
            </Button>
          )}
        </FileButton>
        <Button
          onClick={async () => {
            const { data: validatedImagesNewFiles } =
              zodImage.safeParse(imagesNewFiles)
            if (!validatedImagesNewFiles) {
              alert('Invalid imageNew format')
              return
            }

            const formData = new FormData()
            try {
              validatedImagesNewFiles.forEach((image) => {
                formData.append('imagesNewFiles', image, image.name)
              })
            } catch (err) {
              alert('Error appending to formData')
              console.error(err)
              return
            }

            setOnRequest(true)
            try {
              const res = await axios.post(
                `${envClient.API_ADMIN_URL}/pages/home/image/post`,
                formData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                },
              )
              if (res.status === 200) {
                window.location.reload()
              } else {
                alert(
                  `Error creating brands: ${
                    res.data?.message || errorUnexpected
                  }`,
                )
                console.error(res)
              }
            } catch (err) {
              alert('Error creating brands')
              console.error(err)
            }
            setOnRequest(false)
          }}
          type="button"
          disabled={
            JSON.stringify(imagesNew) === JSON.stringify(imagesHomePageMinio) ||
            onRequest
          }
          color="green"
        >
          {onRequest ? 'Wait ...' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
