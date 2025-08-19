import classes from '@/css/DndList.module.css'

import type { typeBrands } from '@/utils/getPostgres'

import { zodImage } from '@/data/zod'

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { RxDragHandleDots2 } from 'react-icons/rx'
import cx from 'clsx'
import NextImage from 'next/image'
import { Button, FileButton, Image, Text, Tooltip } from '@mantine/core'
import { sanitizeFilename } from '@/utils/sanitize'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { z } from 'zod'
import axios from 'axios'
import { envClient } from '@/env'
import { errorUnexpected } from '@/data/error'
import { useListState } from '@mantine/hooks'

type BrandsComponentProps = {
  brandsPostgres: typeBrands
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

export function BrandsComponent({
  brandsPostgres,
  onRequest,
  setOnRequest,
}: BrandsComponentProps) {
  const [brandsNew, setBrandsNew] = useState(brandsPostgres)
  const [brandNewFiles, setBrandNewFiles] = useState<File[]>([])

  const [state, handlers] = useListState(brandsNew)
  useEffect(() => {
    if (JSON.stringify(brandsNew) !== JSON.stringify(state)) {
      handlers.setState(brandsNew)
    }
  }, [brandsNew])

  const [imagesVisible, setImagesVisible] = useState(false)

  return (
    <div className="flex flex-col h-full gap-2 p-2 border border-neutral-300 rounded-lg bg-white">
      <h1 className="text-center text-2xl">Brands</h1>

      {imagesVisible ? (
        <>
          {state.length > 0 ? (
            <DragDropContext
              onDragEnd={({ destination, source }) => {
                if (!destination || destination.index === source.index) return
                const reordered = [...state]
                const [moved] = reordered.splice(source.index, 1)
                reordered.splice(destination.index, 0, moved)
                setBrandsNew(reordered)
              }}
            >
              <Droppable droppableId="dnd-list" direction="vertical">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {state.map((brand, index) => (
                      <Draggable
                        key={`${index.toString()}`}
                        index={index}
                        draggableId={`${index.toString()}`}
                      >
                        {(provided, snapshot) => (
                          <div
                            className={cx('gap-2', classes.item, {
                              [classes.itemDragging]: snapshot.isDragging,
                            })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className={classes.dragHandle}
                            >
                              <RxDragHandleDots2 size={20} />
                            </div>
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
                                      brandsPostgres.includes(brand)
                                        ? `${envClient.API_ADMIN_URL}/product/brand/${brand}`
                                        : URL.createObjectURL(
                                            brandNewFiles[
                                              brandNewFiles.findIndex(
                                                (file) =>
                                                  sanitizeFilename(
                                                    file.name
                                                  ) === brand
                                              )
                                            ]
                                          )
                                    }
                                    alt={brand}
                                    fill
                                    style={{
                                      objectFit: 'contain',
                                      background: 'white',
                                    }}
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
                                  color: brandsPostgres.includes(brand)
                                    ? 'black'
                                    : 'green',
                                }}
                              >
                                {brand}
                              </Text>
                            </Tooltip>
                            <Button
                              onClick={async () => {
                                if (brandsPostgres.includes(brand)) {
                                  setOnRequest(true)
                                  try {
                                    const res = await axios.delete(
                                      `${envClient.API_ADMIN_URL}/product/brand/delete`,
                                      {
                                        data: { brand },
                                      }
                                    )
                                    if (res.status === 200) {
                                      window.location.reload()
                                    } else {
                                      alert(
                                        `Error deleting ${brand}: ${
                                          res.data?.message || errorUnexpected
                                        }`
                                      )
                                      console.error(res)
                                    }
                                  } catch (err) {
                                    alert(`Error deleting ${brand}`)
                                    console.error(err)
                                  }
                                  setOnRequest(false)
                                } else {
                                  setBrandsNew((prev) =>
                                    prev.filter((b) => b !== brand)
                                  )
                                  setBrandNewFiles((prev) =>
                                    prev.filter((f) => f.name !== brand)
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <p className="text-red-500">You have not created any brands yet.</p>
          )}
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
              return !brandsNew.includes(sanitizeFilename(file.name))
            })
            setBrandsNew((prev) => [
              ...prev,
              ...newFiles.map((file) => sanitizeFilename(file.name)),
            ])
            setBrandNewFiles((prev) => [...prev, ...newFiles])
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
            const { data: validatedBrandNew } = z
              .array(z.string())
              .safeParse(brandsNew)
            if (!validatedBrandNew) {
              alert('Invalid brandNew format')
              return
            }

            const { data: validatedImageNew } =
              zodImage.safeParse(brandNewFiles)
            if (!validatedImageNew) {
              alert('Invalid imageNew format')
              return
            }

            const formData = new FormData()
            try {
              formData.append('brandNew', JSON.stringify(validatedBrandNew))
              validatedImageNew.forEach((image) => {
                formData.append('imageNew', image, image.name)
              })
            } catch (err) {
              alert('Error appending to formData')
              console.error(err)
              return
            }

            setOnRequest(true)
            try {
              const res = await axios.post(
                `${envClient.API_ADMIN_URL}/product/brand/post`,
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
            } catch (err) {
              alert('Error creating brands')
              console.error(err)
            }
            setOnRequest(false)
          }}
          type="button"
          disabled={
            JSON.stringify(brandsNew) === JSON.stringify(brandsPostgres) ||
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
