'use client'

import classes from '@/css/DndList.module.css'
import cx from 'clsx'

import { ROUTE_ERROR } from '@/data/routes'
import { envClient } from '@/envClient'
import { zodHomePage } from '@/lib/postgres/data/zod'
import { typeHomePage } from '@/utils/getPostgres'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { Button, Select, Table, TextInput } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import axios from 'axios'
import { Fragment, useEffect, useState } from 'react'
import { RxDragHandleDots2 } from 'react-icons/rx'
import { AdminProvider } from '@/app/admin/components/AdminProvider'
import { Review } from '@/app/admin/home/client/Review'

type AdminHomePageClientProps = {
  home_page: typeHomePage
  imagesHomePageMinio: string[]
}

export function AdminHomePageClient({
  home_page,
  imagesHomePageMinio,
}: AdminHomePageClientProps) {
  const [onRequest, setOnRequest] = useState(false)
  const [homePage, setHomePage] = useState(home_page)
  const [smallerImagesState, smallerImagesHandlers] = useListState(
    home_page.smaller_images,
  )
  const [quotesState, quotesHandlers] = useListState(home_page.quotes)
  const [faqState, faqHandlers] = useListState(home_page.faq)
  const [reviewsState, reviewsHandlers] = useListState(home_page.reviews)
  useEffect(() => {
    if (
      JSON.stringify(homePage.smaller_images) !==
      JSON.stringify(smallerImagesState)
    ) {
      smallerImagesHandlers.setState(homePage.smaller_images)
    }
    if (JSON.stringify(homePage.quotes) !== JSON.stringify(quotesState)) {
      quotesHandlers.setState(homePage.quotes)
    }
    if (JSON.stringify(homePage.faq) !== JSON.stringify(faqState)) {
      faqHandlers.setState(homePage.faq)
    }
    if (JSON.stringify(homePage.reviews) !== JSON.stringify(reviewsState)) {
      reviewsHandlers.setState(homePage.reviews)
    }
  }, [homePage])

  return (
    <AdminProvider>
      <div className="flex flex-col border border-neutral-300 rounded-lg bg-white m-4 p-1 overflow-x-auto">
        <h1 className="mx-auto text-2xl font-bold m-2">Home Page</h1>
        <div className="flex justify-evenly gap-2">
          <div>
            <h2 className="text-center p-1">Big Image</h2>
            <div className="flex gap-2 border border-[var(--mantine-border)] rounded-lg p-2">
              <Select
                data={imagesHomePageMinio}
                value={homePage.big_image.phone}
                onChange={(value) =>
                  setHomePage((prev) => ({
                    ...prev,
                    big_image: { ...prev.big_image, phone: value || '' },
                  }))
                }
                disabled={onRequest}
                checkIconPosition="right"
                maxDropdownHeight={200}
                searchable
                nothingFoundMessage="Nothing found..."
                placeholder="phone"
              />
              <Select
                data={imagesHomePageMinio}
                value={homePage.big_image.laptop}
                onChange={(value) =>
                  setHomePage((prev) => ({
                    ...prev,
                    big_image: { ...prev.big_image, laptop: value || '' },
                  }))
                }
                disabled={onRequest}
                checkIconPosition="right"
                maxDropdownHeight={200}
                searchable
                nothingFoundMessage="Nothing found..."
                placeholder="laptop"
              />
              <TextInput
                value={homePage.big_image.url}
                onChange={(e) =>
                  setHomePage((prev) => ({
                    ...prev,
                    big_image: { ...prev.big_image, url: e.target.value },
                  }))
                }
                placeholder="URL"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="mx-auto p-1">Smaller Images</h2>
            {homePage.smaller_images.length > 0 ? (
              <DragDropContext
                onDragEnd={({ destination, source }) => {
                  if (!destination || destination.index === source.index) return
                  const reordered = [...smallerImagesState]
                  const [moved] = reordered.splice(source.index, 1)
                  reordered.splice(destination.index, 0, moved)
                  setHomePage((prev) => ({
                    ...prev,
                    smaller_images: reordered,
                  }))
                }}
              >
                <Droppable droppableId="dnd-list" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {homePage.smaller_images.map((smaller_image, index) => (
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
                                data={imagesHomePageMinio}
                                value={homePage.smaller_images[index].image}
                                onChange={(value) =>
                                  setHomePage((prev) => ({
                                    ...prev,
                                    smaller_images: prev.smaller_images.map(
                                      (item, i) =>
                                        i === index
                                          ? { ...item, image: value || '' }
                                          : item,
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
                                value={homePage.smaller_images[index].url}
                                onChange={(e) =>
                                  setHomePage((prev) => ({
                                    ...prev,
                                    smaller_images: prev.smaller_images.map(
                                      (item, i) =>
                                        i === index
                                          ? { ...item, url: e.target.value }
                                          : item,
                                    ),
                                  }))
                                }
                                placeholder="URL"
                              />
                              <Button
                                onClick={async () => {
                                  if (
                                    home_page.smaller_images.includes(
                                      smaller_image,
                                    )
                                  ) {
                                    setOnRequest(true)
                                    try {
                                      const res = await axios.delete(
                                        `${envClient.API_ADMIN_URL}/pages/home/smaller_image`,
                                        {
                                          data: {
                                            smaller_image: smaller_image.image,
                                          },
                                        },
                                      )
                                      if (res.status === 200) {
                                        window.location.reload()
                                      } else {
                                        alert(
                                          `Error deleting smaller image ${smaller_image}: ${
                                            res.data?.message || 'Unexpected error'
                                          }`,
                                        )
                                        console.error(res)
                                      }
                                    } catch (err) {
                                      alert(`Error deleting smaller image`)
                                      console.error(err)
                                    }
                                    setOnRequest(false)
                                  } else {
                                    setHomePage((prev) => ({
                                      ...prev,
                                      smaller_images:
                                        prev.smaller_images.filter(
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
                You have not created any Smaller Image&apos;s yet.
              </p>
            )}
            <Button
              type="button"
              onClick={() =>
                setHomePage((prev) => ({
                  ...prev,
                  smaller_images: [
                    ...prev.smaller_images,
                    { image: '', text: '', url: '' },
                  ],
                }))
              }
              disabled={onRequest}
              color="green"
              className="m-1 mx-auto"
            >
              {onRequest ? 'Wait ...' : 'Create'}
            </Button>
          </div>
          <div className="flex flex-col">
            <h2 className="mx-auto p-1">Quotes</h2>
            {homePage.quotes.length > 0 ? (
              <DragDropContext
                onDragEnd={({ destination, source }) => {
                  if (!destination || destination.index === source.index) return
                  const reordered = [...quotesState]
                  const [moved] = reordered.splice(source.index, 1)
                  reordered.splice(destination.index, 0, moved)
                  setHomePage((prev) => ({ ...prev, quotes: reordered }))
                }}
              >
                <Droppable droppableId="dnd-list" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {homePage.quotes.map((quote, index) => (
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
                                value={homePage.quotes[index].quote}
                                onChange={(e) =>
                                  setHomePage((prev) => ({
                                    ...prev,
                                    quotes: prev.quotes.map((item, i) =>
                                      i === index
                                        ? { ...item, quote: e.target.value }
                                        : item,
                                    ),
                                  }))
                                }
                                placeholder="quote"
                              />
                              <TextInput
                                value={homePage.quotes[index].author}
                                onChange={(e) =>
                                  setHomePage((prev) => ({
                                    ...prev,
                                    quotes: prev.quotes.map((item, i) =>
                                      i === index
                                        ? { ...item, author: e.target.value }
                                        : item,
                                    ),
                                  }))
                                }
                                placeholder="author"
                              />
                              <Button
                                onClick={async () => {
                                  if (home_page.quotes.includes(quote)) {
                                    setOnRequest(true)
                                    try {
                                      const res = await axios.delete(
                                        `${envClient.API_ADMIN_URL}/pages/home/quote`,
                                        {
                                          data: { quote: quote.quote },
                                        },
                                      )
                                      if (res.status === 200) {
                                        window.location.reload()
                                      } else {
                                        alert(
                                          `Error deleting quote: ${
                                            res.data?.message || 'Unexpected error'
                                          }`,
                                        )
                                        console.error(res)
                                      }
                                    } catch (err) {
                                      alert(`Error deleting quote`)
                                      console.error(err)
                                    }
                                    setOnRequest(false)
                                  } else {
                                    setHomePage((prev) => ({
                                      ...prev,
                                      quotes: prev.quotes.filter(
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
                You have not created any Quote&apos;s yet.
              </p>
            )}
            <Button
              type="button"
              onClick={() =>
                setHomePage((prev) => ({
                  ...prev,
                  quotes: [...prev.quotes, { quote: '', author: '' }],
                }))
              }
              disabled={onRequest}
              color="green"
              className="m-1 mx-auto"
            >
              {onRequest ? 'Wait ...' : 'Create'}
            </Button>
          </div>
          <div className="flex flex-col">
            <h2 className="mx-auto p-1">FAQ</h2>
            {homePage.faq.length > 0 ? (
              <DragDropContext
                onDragEnd={({ destination, source }) => {
                  if (!destination || destination.index === source.index) return
                  const reordered = [...faqState]
                  const [moved] = reordered.splice(source.index, 1)
                  reordered.splice(destination.index, 0, moved)
                  setHomePage((prev) => ({ ...prev, faqState: reordered }))
                }}
              >
                <Droppable droppableId="dnd-list" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {homePage.faq.map((faq, index) => (
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
                                value={homePage.faq[index].question}
                                onChange={(e) =>
                                  setHomePage((prev) => ({
                                    ...prev,
                                    faq: prev.faq.map((item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            question: e.target.value,
                                          }
                                        : item,
                                    ),
                                  }))
                                }
                                placeholder="question"
                              />
                              <TextInput
                                value={homePage.faq[index].answer}
                                onChange={(e) =>
                                  setHomePage((prev) => ({
                                    ...prev,
                                    faq: prev.faq.map((item, i) =>
                                      i === index
                                        ? { ...item, answer: e.target.value }
                                        : item,
                                    ),
                                  }))
                                }
                                placeholder="answer"
                              />
                              <Button
                                onClick={async () => {
                                  if (home_page.faq.includes(faq)) {
                                    setOnRequest(true)
                                    try {
                                      const res = await axios.delete(
                                        `${envClient.API_ADMIN_URL}/pages/home/faq`,
                                        {
                                          data: { question: faq.question },
                                        },
                                      )
                                      if (res.status === 200) {
                                        window.location.reload()
                                      } else {
                                        alert(
                                          `Error deleting ${'question'}: ${
                                            res.data?.message || 'Unexpected error'
                                          }`,
                                        )
                                        console.error(res)
                                      }
                                    } catch (err) {
                                      alert(`Error deleting ${'question'}`)
                                      console.error(err)
                                    }
                                    setOnRequest(false)
                                  } else {
                                    setHomePage((prev) => ({
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
              type="button"
              onClick={() =>
                setHomePage((prev) => ({
                  ...prev,
                  faq: [...prev.faq, { question: '', answer: '' }],
                }))
              }
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
            const { data: validatedHomePage } = zodHomePage.safeParse(homePage)
            if (!validatedHomePage) {
              alert('Invalid Home Page format')
              return
            }

            setOnRequest(true)
            try {
              const res = await axios.post(
                `${envClient.API_ADMIN_URL}/pages/home`,
                {
                  home_page: validatedHomePage,
                },
              )
              if (res.status === 200) {
                window.location.reload()
              } else {
                alert(
                  `Error updating page: ${
                    res.data?.message || 'Unexpected error'
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
            JSON.stringify(homePage) === JSON.stringify(home_page) || onRequest
          }
          color="green"
          className="mx-auto m-2"
        >
          {onRequest ? 'Wait ...' : 'Apply changes'}
        </Button>
      </div>
      <Table.ScrollContainer
        minWidth={420}
        style={{ minHeight: '200px' }}
        className="border border-neutral-300 rounded-lg bg-white m-4"
      >
        <DragDropContext
          onDragEnd={({ destination, source }) => {
            if (!destination || destination.index === source.index) return
            const reordered = [...reviewsState]
            const [moved] = reordered.splice(source.index, 1)
            reordered.splice(destination.index, 0, moved)
            setHomePage((prev) => ({
              ...prev,
              reviews: reordered,
            }))
          }}
        >
          <Table key="Reviews" miw={700}>
            <Table.Thead>
              <Table.Tr style={{ borderBottom: 'none' }}>
                <Table.Th
                  colSpan={6}
                  style={{ textAlign: 'center' }}
                  className="text-2xl font-bold"
                >
                  Reviews
                </Table.Th>
              </Table.Tr>

              <Table.Tr>
                <Table.Th />
                <Table.Th style={{ textAlign: 'center' }}>Rating</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Full Name</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Review</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Date</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>

            <Droppable droppableId="dnd-list" direction="vertical">
              {(provided) => (
                <Table.Tbody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {homePage.reviews.map((_, index) => (
                    <Draggable
                      key={`${index.toString()}`}
                      index={index}
                      draggableId={`${index.toString()}`}
                    >
                      {(provided) => (
                        <Table.Tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Fragment key={index}>
                            <Table.Td>
                              <div
                                className={classes.dragHandle}
                                {...provided.dragHandleProps}
                              >
                                <RxDragHandleDots2 size={20} />
                              </div>
                            </Table.Td>
                            <Review
                              key={index}
                              index={index}
                              reviewsState={reviewsState}
                              home_page={home_page}
                              setHomePage={setHomePage}
                              onRequest={onRequest}
                              setOnRequest={setOnRequest}
                            />
                          </Fragment>
                        </Table.Tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Table.Tbody>
              )}
            </Droppable>

            <Table.Tfoot>
              <Table.Tr style={{ borderBottom: 'none' }}>
                <Table.Td colSpan={6}>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() =>
                        setHomePage((prev) => ({
                          ...prev,
                          reviews: [
                            ...prev.reviews,
                            prev.reviews.at(-1)
                              ? { ...prev.reviews.at(-1)!, id: '' }
                              : {
                                  id: '',
                                  rating: 5,
                                  full_name: '',
                                  review: '',
                                  date: new Date().toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }),
                                },
                          ],
                        }))
                      }
                      type="button"
                      disabled={onRequest}
                      color="green"
                    >
                      {onRequest ? 'Wait ...' : 'Create'}
                    </Button>
                    <Button
                      onClick={async () => {
                        const { data: validatedHomePage } =
                          zodHomePage.safeParse(homePage)
                        if (!validatedHomePage) {
                          alert('Invalid Home Page format')
                          return
                        }

                        setOnRequest(true)
                        try {
                          const res = await axios.post(
                            `${envClient.API_ADMIN_URL}/pages/home`,
                            {
                              home_page: validatedHomePage,
                            },
                          )
                          if (res.status === 200) {
                            window.location.reload()
                          } else {
                            alert(
                              `Error updating page: ${
                                res.data?.message || 'Unexpected error'
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
                        JSON.stringify(reviewsState) ===
                          JSON.stringify(home_page.reviews) || onRequest
                      }
                      color="green"
                    >
                      {onRequest ? 'Wait ...' : 'Apply changes'}
                    </Button>
                  </div>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </DragDropContext>
      </Table.ScrollContainer>
    </AdminProvider>
  )
}
