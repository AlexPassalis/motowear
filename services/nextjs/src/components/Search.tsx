import type { Hit } from 'instantsearch.js'

import { useHeaderContext } from '@/context/useHeaderContext'
import { ROUTE_PRODUCT } from '@/data/routes'
import { envClient } from '@/envClient'
import { typesenseClient } from '@/lib/typesense/client'
import { Image } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import {
  Highlight,
  Hits,
  InstantSearch,
  SearchBox,
  useInstantSearch,
  useSearchBox,
} from 'react-instantsearch'
import { facebookPixelSearch } from '@/lib/facebook-pixel'
import { googleAnalyticsSearch } from '@/lib/google-analytics'

type SearchProps = {
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
}

export function Search({ isSearchOpen, setIsSearchOpen }: SearchProps) {
  return (
    <section
      className={`fixed top-0 left-0 w-full h-3/4 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSearchOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ zIndex: 100 }}
    >
      <div className="flex flex-col h-full gap-2 p-4">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 border-[var(--mantine-border)]">
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl">
            Αναζήτηση
          </h1>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex ml-auto justify-center items-center h-10 w-10 rounded-md border border-[var(--mantine-border)] transition-colors hover:cursor-pointer group"
          >
            <AiOutlineClose className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
        </div>
        <div className="mx-auto w-full max-w-[400px] flex flex-col h-full min-h-0">
          {isSearchOpen && (
            <InstantSearch
              searchClient={typesenseClient.searchClient}
              indexName="product"
              future={{ preserveSharedStateOnUnmount: true }}
            >
              <Instant />
            </InstantSearch>
          )}
        </div>
      </div>
    </section>
  )
}

function Instant() {
  const { uiState } = useInstantSearch()

  return (
    <>
      <SearchBox
        autoFocus
        placeholder="π.χ. Μπλουζάκι crypton-x"
        classNames={{
          form: 'relative w-full',
          input:
            'searchbox-no-clear w-full pr-10 pl-2 border rounded-lg text-center !text-lg',
          reset:
            'block absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer',
          resetIcon: 'w-4 h-4',
          submit: 'hidden',
          submitIcon: 'hidden',
        }}
        className="text-xl text-center mb-2"
      />
      {uiState.product?.query && (
        <div
          onClick={() => {
            const query = uiState.product?.query?.trim()
            if (!query) {
              return
            }
            facebookPixelSearch(query)
            googleAnalyticsSearch(query)
          }}
          className="overflow-y-auto"
        >
          <Hits hitComponent={SearchHit} />
        </div>
      )}
    </>
  )
}

type ProductHit = {
  product_type: string
  variant: string
  image: string
}

function SearchHit({ hit }: { hit: Hit<ProductHit> }) {
  const { setIsSearchOpen } = useHeaderContext()
  const { refine } = useSearchBox()

  return (
    <div
      onClick={() => {
        setIsSearchOpen((prev) => !prev)
        refine('')
      }}
      className="flex justify-center w-full p-1 mb-2 rounded-lg border border-[var(--mantine-border)] hover:border-red-500"
    >
      <Link
        href={`${ROUTE_PRODUCT}/${hit.product_type}/${hit.variant}`}
        className="flex items-center gap-2 w-3/4 h-36"
      >
        <div className="relative w-1/2 h-full">
          <Image
            component={NextImage}
            src={`${envClient.MINIO_PRODUCT_URL}/${hit.product_type}/${hit.image}`}
            alt={hit.variant}
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className="flex flex-col w-1/2 h-full text-xl justify-center">
          <p className="flex-1 flex items-center break-words overflow-hidden">
            <Highlight
              attribute="product_type"
              hit={hit}
              highlightedTagName="mark"
            />
          </p>
          <p className="flex-1 flex items-center break-words overflow-hidden">
            <Highlight
              attribute="variant"
              hit={hit}
              highlightedTagName="mark"
            />
          </p>
        </div>
      </Link>
    </div>
  )
}
