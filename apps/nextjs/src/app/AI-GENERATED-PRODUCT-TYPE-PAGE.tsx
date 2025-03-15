'use client'

import { ProductRow } from '@/data/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi'

// Color map for Tailwind classes
const colorMap: Record<string, string> = {
  black: 'bg-black',
  white: 'bg-white border border-gray-300',
  gray: 'bg-gray-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  brown: 'bg-amber-800',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  fuchsia: 'bg-fuchsia-500',
  lime: 'bg-lime-500',
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-500',
  zinc: 'bg-zinc-500',
  stone: 'bg-stone-500',
  amber: 'bg-amber-500',
}

type ProductPageClientProps = {
  type: string
  defaultVersions: ProductRow[]
  defaultVersion?: string
  defaultBrands: string[]
  defaultBrand?: string
  defaultColor?: string
  defaultSize?: string
}

export function ProductPageClient({
  type,
  defaultVersions,
  defaultVersion,
  defaultBrands,
  defaultBrand,
  defaultColor,
  defaultSize,
}: ProductPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Product selection state
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(
    defaultVersion
  )
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    defaultBrand
  )
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    defaultColor
  )
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    defaultSize
  )

  // UI state
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Filter products based on selections
  const filteredByBrand = useMemo(() => {
    if (!selectedBrand) return defaultVersions
    return defaultVersions.filter(product => product.brand === selectedBrand)
  }, [defaultVersions, selectedBrand])

  // Get unique versions
  const uniqueVersions = useMemo(() => {
    return Array.from(new Set(filteredByBrand.map(row => row.version)))
  }, [filteredByBrand])

  // Filter by version
  const filteredByVersion = useMemo(() => {
    if (!selectedVersion) return filteredByBrand
    return filteredByBrand.filter(
      product => product.version === selectedVersion
    )
  }, [filteredByBrand, selectedVersion])

  // Get unique colors
  const uniqueColors = useMemo(() => {
    return Array.from(
      new Set(
        filteredByVersion
          .map(row => row.color)
          .filter((c): c is string => c !== null)
      )
    )
  }, [filteredByVersion])

  // Filter by color
  const filteredByColor = useMemo(() => {
    if (!selectedColor) return filteredByVersion
    return filteredByVersion.filter(product => product.color === selectedColor)
  }, [filteredByVersion, selectedColor])

  // Get unique sizes
  const uniqueSizes = useMemo(() => {
    const allSizes = filteredByColor
      .flatMap(row => row.sizes || [])
      .filter(size => size !== null)

    return Array.from(new Set(allSizes))
  }, [filteredByColor])

  // Current selected product
  const selectedProduct = useMemo(() => {
    if (!selectedSize) return filteredByColor[0]
    return (
      filteredByColor.find(product => product.sizes?.includes(selectedSize)) ||
      filteredByColor[0]
    )
  }, [filteredByColor, selectedSize])

  // Update URL search params when selections change
  const updateSearchParams = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString() || '')

    if (selectedBrand) {
      params.set('brand', selectedBrand)
    } else {
      params.delete('brand')
    }

    if (selectedVersion) {
      params.set('version', selectedVersion)
    } else {
      params.delete('version')
    }

    if (selectedColor) {
      params.set('color', selectedColor)
    } else {
      params.delete('color')
    }

    if (selectedSize) {
      params.set('size', selectedSize)
    } else {
      params.delete('size')
    }

    router.replace(`/product/${encodeURIComponent(type)}?${params.toString()}`)
  }, [
    searchParams,
    router,
    type,
    selectedBrand,
    selectedVersion,
    selectedColor,
    selectedSize,
  ])

  useEffect(() => {
    updateSearchParams()
  }, [
    selectedBrand,
    selectedVersion,
    selectedColor,
    selectedSize,
    updateSearchParams,
  ])

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    if (selectedBrand && !uniqueVersions.includes(selectedVersion || '')) {
      setSelectedVersion(uniqueVersions[0] || undefined)
    }
  }, [selectedBrand, selectedVersion, uniqueVersions])

  useEffect(() => {
    if (selectedVersion && !uniqueColors.includes(selectedColor || '')) {
      setSelectedColor(uniqueColors[0] || undefined)
    }
  }, [selectedVersion, selectedColor, uniqueColors])

  useEffect(() => {
    if (selectedColor && !uniqueSizes.includes(selectedSize || '')) {
      setSelectedSize(uniqueSizes[0] || undefined)
    }
  }, [selectedColor, selectedSize, uniqueSizes])

  // Reset active image index when selected product changes
  useEffect(() => {
    setActiveImageIndex(0)
  }, [selectedProduct])

  if (!selectedProduct) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center">
            No products available for the selected options.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
            {selectedProduct.images && selectedProduct.images.length > 0 ? (
              selectedProduct.images.map((image, index) => {
                const imageUrl = `http://minio:9000/product/${type}/${selectedProduct.version}/${image}`
                return (
                  <div
                    key={image}
                    className={`absolute inset-0 ${
                      activeImageIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={selectedProduct.version}
                      fill
                      className="object-contain"
                    />
                  </div>
                )
              })
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-400">No image available</p>
              </div>
            )}

            {/* Image navigation arrows */}
            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex(prev =>
                      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex(prev =>
                      prev === selectedProduct.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
                >
                  <FiChevronRight />
                </button>
              </>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl font-bold mb-4">
              {selectedProduct.version}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl font-bold">
                €{selectedProduct.price.toFixed(2)}
              </span>
              {selectedProduct.price_before && (
                <span className="text-gray-400 line-through">
                  €{selectedProduct.price_before.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">{selectedProduct.description}</p>

            {/* Brand buttons */}
            {defaultBrands.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {defaultBrands.map(brand => (
                  <button
                    key={brand}
                    className={`px-3 py-1 border rounded ${
                      selectedBrand === brand
                        ? 'bg-black text-white'
                        : 'bg-white'
                    }`}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}

            {/* Version buttons */}
            {uniqueVersions.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {uniqueVersions.map(version => (
                  <button
                    key={version}
                    className={`px-3 py-1 border rounded ${
                      selectedVersion === version
                        ? 'bg-black text-white'
                        : 'bg-white'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    {version}
                  </button>
                ))}
              </div>
            )}

            {/* Color buttons */}
            {uniqueColors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {uniqueColors.map(color => {
                  const bgColorClass =
                    colorMap[color.toLowerCase()] || 'bg-gray-500'
                  return (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full ${bgColorClass} ${
                        selectedColor === color ? 'ring-2 ring-black' : ''
                      }`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    />
                  )
                })}
              </div>
            )}

            {/* Size buttons */}
            {uniqueSizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {uniqueSizes.map(size => (
                  <button
                    key={size}
                    className={`w-8 h-8 flex items-center justify-center border rounded ${
                      selectedSize === size ? 'bg-black text-white' : 'bg-white'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            {/* Add to Cart section */}
            <div className="flex items-center gap-2 mt-6">
              <div className="flex items-center border rounded">
                <button
                  className="px-2 py-2 border-r"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <FiMinus />
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  className="px-2 py-2 border-l"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <FiPlus />
                </button>
              </div>

              <button className="flex-1 bg-black text-white py-2 px-4 rounded">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
