'use client'

import { ProductRow } from '@/data/types'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { RefObject, useRef, useState } from 'react'
import { AiOutlineLeftCircle, AiOutlineRightCircle } from 'react-icons/ai'

type ProductPageClientProps = {
  productTypes: string[]
  type: string
  uniqueBrands: string[]
  uniqueVersions: string[]
  defaultVersions: ProductRow[]
  defaultVersion: undefined | string
}

export function ProductPageClient({
  productTypes,
  type,
  uniqueBrands,
  uniqueVersions,
  defaultVersions,
  defaultVersion,
}: ProductPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dialogRef = useRef<null | HTMLDialogElement>(null)
  const [dialogVersion, setDialogVersion] = useState<
    '' | 'brand' | 'version' | 'color' | 'size'
  >('')

  const [choosenVersion, setChoosenVersion] = useState(
    defaultVersions.find(row => row.version === defaultVersion) ??
      defaultVersions[0]
  )

  function openDialog(string: 'brand' | 'version' | 'color' | 'size') {
    setDialogVersion(string)
    dialogRef.current?.showModal()
  }
  function closeDialog() {
    dialogRef.current?.close()
    setDialogVersion('')
  }

  return (
    <>
      <Dialog
        dialogRef={dialogRef}
        dialogVersion={dialogVersion}
        closeDialog={closeDialog}
      />
      <div className="flex flex-col">
        <div className="relative w-full h-[400px]">
          <Image
            src={`http://minio:9000/product/${type}/${choosenVersion.version}/${choosenVersion.images[0]}`}
            alt={choosenVersion.version}
            quality={100}
            fill
            sizes="100vw"
            className="w-full h-aut object-cover"
            priority
          />
          <button
            onClick={() => {}}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group z-10"
          >
            <AiOutlineLeftCircle className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
          <button
            onClick={() => {}}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group z-10"
          >
            <AiOutlineRightCircle className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-start gap-4 m-4">
        <button onClick={() => {}} className="border p-2 hover: cursor-pointer">
          Διάλεξε μάρκα: {}
        </button>
        <button
          onClick={() => {
            openDialog('brand')
          }}
          className="border p-2 hover: cursor-pointer"
        >
          Διάλεξε εκδωχή:{' '}
          <span className="text-red-500">{choosenVersion.version}</span>
        </button>
      </div>
    </>
  )
}

type DialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>
  dialogVersion: '' | 'brand' | 'version' | 'color' | 'size'
  closeDialog: () => void
}

function Dialog({ dialogRef, dialogVersion, closeDialog }: DialogProps) {
  function ExitButton() {
    return <button onClick={() => closeDialog()}>Έξοδος</button>
  }
  function renderContent() {
    switch (dialogVersion) {
      case 'brand':
        return (
          <>
            <h1>Brand</h1>
            <ExitButton />
          </>
        )
      case 'version':
        return (
          <>
            <h1>Version</h1>
            <ExitButton />
          </>
        )
      case 'color':
        return (
          <>
            <h1>Color</h1>
            <ExitButton />
          </>
        )
      case 'size':
        return (
          <>
            <h1>Size</h1>
            <ExitButton />
          </>
        )
      default:
        return <ExitButton />
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="top-1/2 left-1/2 transform -translate-1/2 border rounded-lg border-neutral-300 bg-white px-4 py-2"
    >
      {renderContent()}
    </dialog>
  )
}
