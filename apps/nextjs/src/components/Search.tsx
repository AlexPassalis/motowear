import { useHeaderContext } from '@/context/useHeaderContext'
import { ROUTE_PRODUCT } from '@/data/routes'
import { envClient } from '@/env'
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
import type { Hit } from '../../node_modules/.pnpm/instantsearch.js@4.78.0_algoliasearch@5.21.0/node_modules/instantsearch.js/es/types/results'

type SearchProps = {
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
}

export function Search({ isSearchOpen, setIsSearchOpen }: SearchProps) {
  return (
    <section
      className={`z-20 fixed top-0 left-0 w-full h-3/4 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSearchOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex flex-col gap-2 h-full p-4">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 border-gray-200">
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl">
            Αναζήτηση
          </h1>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex ml-auto justify-center items-center h-10 w-10 rounded-md border border-gray-200 transition-colors hover:cursor-pointer group"
          >
            <AiOutlineClose className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
        </div>
        <InstantSearch
          searchClient={typesenseClient.searchClient}
          indexName="product"
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Instant />
        </InstantSearch>
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
        placeholder="Αναζήτησε τα αγαπημένα σου προϊόντα ..."
        classNames={{
          form: 'relative w-full',
          input:
            'searchbox-no-clear w-full pr-10 pl-2 border rounded-lg text-center',
          reset:
            'block absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer',
          resetIcon: 'w-4 h-4',
          submit: 'hidden',
          submitIcon: 'hidden',
        }}
        className="text-xl text-center"
      />
      {uiState.product?.query && (
        <div className="flex-1 overflow-y-auto">
          <Hits hitComponent={SearchHit} />
        </div>
      )}
    </>
  )
}

function SearchHit({ hit }: { hit: Hit }) {
  const { setIsSearchOpen } = useHeaderContext()
  const { refine } = useSearchBox()

  return (
    <div
      onClick={() => {
        setIsSearchOpen(prev => !prev)
        refine('')
      }}
      className="flex justify-center w-full p-1 mb-2 rounded-lg border border-gray-200 hover:border-red-500"
    >
      <Link
        href={`${ROUTE_PRODUCT}/${hit.type}/${hit.version}`}
        className="flex items-center gap-2 w-3/4 h-20"
      >
        <div className="relative w-1/2 h-full">
          <Image
            component={NextImage}
            src={`${envClient.MINIO_PRODUCT_URL}/${hit.type}/${hit.image}`}
            alt={hit.version}
            fill
            objectFit="contain"
          />
        </div>
        <div className="flex flex-col w-1/2 h-full text-xl justify-center">
          <p>
            <Highlight attribute="type" hit={hit} highlightedTagName="mark" />
          </p>
          <p>
            <Highlight
              attribute="version"
              hit={hit}
              highlightedTagName="mark"
            />
          </p>
        </div>
      </Link>
    </div>
  )
}
