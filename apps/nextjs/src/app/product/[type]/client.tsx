'use client'

import { ProductRow } from '@/data/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

type ProductPageClientProps = {
  type: string
  productVersions: ProductRow[]
  defaultVersion: string | undefined
  brands: string[]
  defaultBrand: string | undefined
  defaultColor: string | undefined
  defaultSize: string | undefined
}

export function ProductPageClient({
  type,
  productVersions,
  defaultVersion,
  brands,
  defaultBrand,
  defaultColor,
  defaultSize,
}: ProductPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [versions, setVersions] = useState(
    defaultBrand
      ? productVersions.filter(p => p.brand === defaultBrand)
      : productVersions
  )
  const [version, setVersion] = useState(
    defaultVersion
      ? productVersions.find(v => v.version === defaultVersion) ??
          productVersions[0]
      : productVersions[0]
  )

  const [colors, setColors] = useState(
    defaultVersion
      ? productVersions
          .filter(p => p.version === defaultVersion)
          .map(v => v.color)
          .filter(v => v !== null)
      : productVersions.map(v => v.color).filter(v => v !== null)
  )
  const [color, setColor] = useState(defaultColor ?? colors[0])

  return (
    <form className="flex flex-col justify-center h-screen items-center gap-4">
      <h1>Type: {type}</h1>

      {brands.length !== 0 ? (
        <div className="border rounded-lg border-neutral-300 bg-white px-4 py-2">
          <label htmlFor="brand">Brand: </label>
          <select
            id="brand"
            defaultValue={defaultBrand ?? '-'}
            onChange={e => {
              const params = new URLSearchParams(searchParams?.toString())
              const selectedBrand = e.target.value
              if (selectedBrand === '-') {
                setVersions(productVersions)
                params.delete('brand')
                params.delete('version')
              } else {
                setVersions(
                  productVersions.filter(p => p.brand === selectedBrand)
                )
                params.set('brand', selectedBrand)
                params.delete('version')
              }
              router.push(`${pathname}?${params.toString()}`)
            }}
          >
            <option value="-" className="text-center">
              -
            </option>
            {brands.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {productVersions.length > 1 ? (
        <div className="border rounded-lg border-neutral-300 bg-white px-4 py-2">
          <label htmlFor="version">Version: </label>
          <select
            id="version"
            defaultValue={version.version}
            onChange={e => {
              const selectedVersion = e.target.value
              setVersion(
                productVersions.find(v => v.version === e.target.value) ??
                  productVersions[0]
              )
              const params = new URLSearchParams(searchParams?.toString())
              params.set('version', selectedVersion)
              router.push(`${pathname}?${params.toString()}`)
            }}
          >
            {versions.map(product => (
              <option key={product.id} value={product.version}>
                {product.version}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {colors.length > 1 ? (
        <div className="border rounded-lg border-neutral-300 bg-white px-4 py-2">
          <label htmlFor="color">Color: </label>
          <select
            id="color"
            defaultValue={defaultColor ?? colors[0]}
            onChange={e => {
              const selectedColor = e.target.value
              setColor(selectedColor)
            }}
          >
            {colors.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      ) : null}

      <h1>{defaultSize}</h1>

      <button
        type="submit"
        onClick={e => {
          e.preventDefault()
        }}
      ></button>
    </form>
  )
}
