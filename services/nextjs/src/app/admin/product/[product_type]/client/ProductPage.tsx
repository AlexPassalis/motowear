import type { typeProductPage } from '@/lib/postgres/data/type'
import { zodProductPage } from '@/lib/postgres/data/zod'

import classes from '@/css/DndList.module.css'
import cx from 'clsx'
import { errorUnexpected } from '@/data/error'
import { envClient } from '@/envClient'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { Button, Modal, Select, Textarea, TextInput } from '@mantine/core'
import axios from 'axios'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { RxDragHandleDots2 } from 'react-icons/rx'
import { useDisclosure, useListState } from '@mantine/hooks'

type ProductPageComponentProps = {
  product_type: string
  product_page: typeProductPage
  imagesMinio: string[]
  onRequest: boolean
  setOnRequest: Dispatch<SetStateAction<boolean>>
}

export function ProductPageComponent({
  product_type,
  product_page,
  imagesMinio,
  onRequest,
  setOnRequest,
}: ProductPageComponentProps) {
  const [modalState, setModalState] = useState<'' | 'Description' | 'Upsell'>(
    '',
  )
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false)

  const [productPage, setProductPage] = useState(product_page)

  const [imagesState, imagesHandlers] = useListState(product_page.images)
  const [faqState, fagHandlers] = useListState(product_page.faq)
  const [carouselState, carouselHandlers] = useListState(product_page.carousel)
  useEffect(() => {
    if (JSON.stringify(productPage.images) !== JSON.stringify(imagesState)) {
      imagesHandlers.setState(productPage.images)
    }

    if (JSON.stringify(productPage.faq) !== JSON.stringify(faqState)) {
      fagHandlers.setState(productPage.faq)
    }

    if (
      JSON.stringify(productPage.carousel) !== JSON.stringify(carouselState)
    ) {
      carouselHandlers.setState(productPage.carousel)
    }
  }, [productPage])

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => {
          closeModal()
          setModalState('')
        }}
        title={`${product_page.product_type} ${modalState}`}
        centered
      >
        <>
          {modalState === 'Description' && (
            <Textarea
              autosize
              minRows={10}
              placeholder="This is the product description."
              value={productPage.product_description}
              onChange={(e) =>
                setProductPage((prev) => ({
                  ...prev,
                  product_description: e.target.value,
                }))
              }
            />
          )}
          {modalState === 'Upsell' && (
            <Textarea
              autosize
              minRows={10}
              placeholder="This is the upsell Title."
              value={productPage.upsell}
              onChange={(e) =>
                setProductPage((prev) => ({
                  ...prev,
                  upsell: e.target.value,
                }))
              }
            />
          )}
        </>
      </Modal>
      <div className="flex flex-col border border-neutral-300 rounded-lg bg-white m-4 p-1 overflow-x-auto">
        <h1 className="mx-auto text-2xl font-bold m-2">Product Page</h1>
        <div className="flex justify-evenly gap-2">
          <div>
            <h2 className="text-center p-1">Μεγεθολόγιο</h2>
            <Select
              data={imagesMinio}
              defaultValue={productPage.size_chart}
              onBlur={(e) =>
                setProductPage((prev) => ({
                  ...prev,
                  size_chart: e.target.value,
                }))
              }
              disabled={onRequest}
              checkIconPosition="right"
              maxDropdownHeight={200}
              searchable
              nothingFoundMessage="Nothing found..."
            />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-center p-1">Description</h2>
            <Button
              onClick={() => {
                setModalState('Description')
                openModal()
              }}
              color="blue"
              disabled={onRequest}
            >
              {productPage?.product_description.length > 0 && '...'}
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="p-1">Upsell</h2>
            <Button
              onClick={() => {
                setModalState('Upsell')
                openModal()
              }}
              color="blue"
              disabled={onRequest}
            >
              {productPage?.upsell.length > 0 && '...'}
            </Button>
          </div>
          <div className="flex flex-col">
            <h2 className="mx-auto p-1">Images</h2>
            {productPage.images.length > 0 ? (
              <DragDropContext
                onDragEnd={({ destination, source }) => {
                  if (!destination || destination.index === source.index) {
                    return
                  }
                  const reordered = [...imagesState]
                  const [moved] = reordered.splice(source.index, 1)
                  reordered.splice(destination.index, 0, moved)
                  setProductPage((prev) => ({ ...prev, images: reordered }))
                }}
              >
                <Droppable droppableId="dnd-list" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {imagesState.map((image, index) => (
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
                              <Select
                                data={imagesMinio}
                                defaultValue={productPage.images[index]}
                                onBlur={(e) =>
                                  setProductPage((prev) => ({
                                    ...prev,
                                    images: e.target.value
                                      ? prev.images.map((img, i) =>
                                          i === index ? e.target.value : img,
                                        )
                                      : prev.images.filter((_, i) => i !== index),
                                  }))
                                }
                                disabled={onRequest}
                                checkIconPosition="right"
                                maxDropdownHeight={200}
                                searchable
                                nothingFoundMessage="Nothing found..."
                              />
                              <Button
                                onClick={async () => {
                                  if (product_page.images.includes(image)) {
                                    setOnRequest(true)
                                    try {
                                      const res = await axios.delete(
                                        `${envClient.API_ADMIN_URL}/product/product_type/product_page/images`,
                                        {
                                          data: {
                                            product_type: product_type,
                                            image: image,
                                          },
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
                                    setProductPage((prev) => ({
                                      ...prev,
                                      images: prev.images.filter(
                                        (_, i) => i !== index,
                                      ),
                                    }))
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
              <p className="text-red-500">
                You have not created any Image items yet.
              </p>
            )}
            <Button
              onClick={() =>
                setProductPage((prev) => ({
                  ...prev,
                  images: [...prev.images, ''],
                }))
              }
              type="button"
              disabled={onRequest}
              color="green"
              className="m-1 mx-auto"
            >
              {onRequest ? 'Wait ...' : 'Create'}
            </Button>
          </div>
          <div className="flex flex-col">
            <h2 className="mx-auto p-1">FAQ</h2>
            {productPage.faq.length > 0 ? (
              <DragDropContext
                onDragEnd={({ destination, source }) => {
                  if (!destination || destination.index === source.index) {
                    return
                  }
                  const reordered = [...faqState]
                  const [moved] = reordered.splice(source.index, 1)
                  reordered.splice(destination.index, 0, moved)
                  setProductPage((prev) => ({ ...prev, faq: reordered }))
                }}
              >
                <Droppable droppableId="dnd-list" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {faqState.map((faq, index) => (
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
                              <TextInput
                                defaultValue={productPage.faq[index]?.question}
                                onChange={(e) =>
                                  setProductPage((prev) => ({
                                    ...prev,
                                    faq: prev.faq.map((faq, i) =>
                                      i === index
                                        ? { ...faq, question: e.target.value }
                                        : faq,
                                    ),
                                  }))
                                }
                                placeholder="question"
                              />
                              <TextInput
                                defaultValue={productPage.faq[index]?.answer}
                                onChange={(e) =>
                                  setProductPage((prev) => ({
                                    ...prev,
                                    faq: prev.faq.map((faq, i) =>
                                      i === index
                                        ? { ...faq, answer: e.target.value }
                                        : faq,
                                    ),
                                  }))
                                }
                                placeholder="answer"
                              />
                              <Button
                                onClick={async () => {
                                  if (product_page.faq.includes(faq)) {
                                    setOnRequest(true)
                                    try {
                                      const res = await axios.delete(
                                        `${envClient.API_ADMIN_URL}/product/product_type/product_page/faq`,
                                        {
                                          data: {
                                            product_type: product_type,
                                            question: faq.question,
                                          },
                                        },
                                      )
                                      if (res.status === 200) {
                                        window.location.reload()
                                      } else {
                                        alert(
                                          `Error deleting ${faq.question}: ${
                                            res.data?.message || errorUnexpected
                                          }`,
                                        )
                                        console.error(res)
                                      }
                                    } catch (err) {
                                      alert(`Error deleting ${faq.question}`)
                                      console.error(err)
                                    }
                                    setOnRequest(false)
                                  } else {
                                    setProductPage((prev) => ({
                                      ...prev,
                                      faq: prev.faq.filter(
                                        (_, i) => i !== index,
                                      ),
                                    }))
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
              <p className="text-red-500">
                You have not created any FAQ&apos;s yet.
              </p>
            )}
            <Button
              onClick={() =>
                setProductPage((prev) => ({
                  ...prev,
                  faq: [...prev.faq, { question: '', answer: '' }],
                }))
              }
              type="button"
              disabled={onRequest}
              color="green"
              className="m-1 mx-auto"
            >
              {onRequest ? 'Wait ...' : 'Create'}
            </Button>
          </div>
          <div className="flex flex-col">
            <h2 className="mx-auto p-1">Carousel</h2>
            {productPage.carousel.length > 0 ? (
              <DragDropContext
                onDragEnd={({ destination, source }) => {
                  if (!destination || destination.index === source.index) {
                    return
                  }
                  const reordered = [...carouselState]
                  const [moved] = reordered.splice(source.index, 1)
                  reordered.splice(destination.index, 0, moved)
                  setProductPage((prev) => ({ ...prev, carousel: reordered }))
                }}
              >
                <Droppable droppableId="dnd-list" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {carouselState.map((carousel, index) => (
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
                              <Select
                                data={imagesMinio}
                                defaultValue={
                                  productPage.carousel[index]?.image
                                }
                                onBlur={(e) =>
                                  setProductPage((prev) => ({
                                    ...prev,
                                    carousel: prev.carousel.map((c, i) =>
                                      i === index
                                        ? { ...c, image: e.target.value }
                                        : c,
                                    ),
                                  }))
                                }
                                disabled={onRequest}
                                checkIconPosition="right"
                                maxDropdownHeight={200}
                                searchable
                                nothingFoundMessage="Nothing found..."
                              />
                              <TextInput
                                defaultValue={
                                  productPage.carousel[index]?.title
                                }
                                onChange={(e) =>
                                  setProductPage((prev) => ({
                                    ...prev,
                                    carousel: prev.carousel.map((c, i) =>
                                      i === index
                                        ? { ...c, title: e.target.value }
                                        : c,
                                    ),
                                  }))
                                }
                                placeholder="title"
                              />
                              <Button
                                onClick={async () => {
                                  if (
                                    product_page.carousel.includes(carousel)
                                  ) {
                                    setOnRequest(true)
                                    try {
                                      const res = await axios.delete(
                                        `${envClient.API_ADMIN_URL}/product/product_type/product_page/carousel`,
                                        {
                                          data: {
                                            product_type: product_type,
                                            image: carousel.image,
                                          },
                                        },
                                      )
                                      if (res.status === 200) {
                                        window.location.reload()
                                      } else {
                                        alert(
                                          `Error deleting ${carousel.image}: ${
                                            res.data?.message || errorUnexpected
                                          }`,
                                        )
                                        console.error(res)
                                      }
                                    } catch (err) {
                                      alert(`Error deleting ${carousel.image}`)
                                      console.error(err)
                                    }
                                    setOnRequest(false)
                                  } else {
                                    setProductPage((prev) => ({
                                      ...prev,
                                      carousel: prev.carousel.filter(
                                        (_, i) => i !== index,
                                      ),
                                    }))
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
              <p className="text-red-500">
                You have not created any Carousel items yet.
              </p>
            )}
            <Button
              onClick={() =>
                setProductPage((prev) => ({
                  ...prev,
                  carousel: [
                    ...prev.carousel,
                    { image: '', title: '', text: '' },
                  ],
                }))
              }
              type="button"
              disabled={onRequest}
              color="green"
              className="m-1 mx-auto"
            >
              {onRequest ? 'Wait ...' : 'Create'}
            </Button>
          </div>
        </div>
        <Button
          onClick={async () => {
            const { data: validatedProductPage } =
              zodProductPage.safeParse(productPage)
            if (!validatedProductPage) {
              alert('Invalid Product Page format')
              return
            }

            setOnRequest(true)
            try {
              const res = await axios.post(
                `${envClient.API_ADMIN_URL}/product/product_type/product_page`,
                {
                  productPage: validatedProductPage,
                },
              )
              if (res.status === 200) {
                window.location.reload()
              } else {
                alert(
                  `Error updating page: ${
                    res.data?.message || errorUnexpected
                  }`,
                )
                console.error(res)
              }
            } catch (err) {
              alert('Error updating page')
              console.error(err)
            }
            setOnRequest(false)
          }}
          type="button"
          disabled={
            JSON.stringify(productPage) === JSON.stringify(product_page) ||
            onRequest
          }
          color="green"
          className="mx-auto m-2"
        >
          {onRequest ? 'Wait ...' : 'Apply changes'}
        </Button>
      </div>
    </>
  )
}
