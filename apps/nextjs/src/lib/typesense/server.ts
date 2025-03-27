import Typesense from 'typesense'
import { getProductPostgres } from '@/utils/getPostgres'
import { envServer } from '@/env'

const typesense = new Typesense.Client({
  nodes: [{ host: 'typesense', port: 8108, protocol: 'http' }],
  apiKey: envServer.TYPESENSE_ADMIN_API_KEY,
})

const collectionName = 'product'

export async function updateTypesense() {
  const { product: productPostgres } = await getProductPostgres()

  try {
    await typesense.collections(collectionName).retrieve()
  } catch {
    console.log(`Collection ${collectionName} not found. Creating it ...`)
    const schema = {
      name: collectionName,
      fields: [
        { name: 'type', type: 'string' as const },
        { name: 'id', type: 'string' as const },
        { name: 'version', type: 'string' as const },
        { name: 'images', type: 'string[]' as const },
        { name: 'price', type: 'float' as const },
        { name: 'brand', type: 'string' as const },
        { name: 'color', type: 'string' as const },
        { name: 'size', type: 'string' as const },
        { name: 'price_before', type: 'float' as const },
      ],
    }
    await typesense.collections().create(schema)
    console.log(`Collection ${collectionName} created successfully.`)
  }

  for (const productType in productPostgres) {
    const products = productPostgres[productType]
    for (const product of products) {
      const document = { ...product, type: productType }
      try {
        await typesense.collections(collectionName).documents().upsert(document)
      } catch (err) {
        console.error(`Error upserting product ${product.id}:`, err)
      }
    }
  }
}

export type Document = {
  type: string
  id: string
  version: string
  images: string[]
  price: number
  brand: string
  color: string
  size: string
  price_before: number
}

export async function deleteTypesenseVersion(id: string) {
  await typesense.collections(collectionName).documents(id).delete()
}

export async function deleteTypesenseImage(id: string, image: string) {
  const document = (await typesense
    .collections(collectionName)
    .documents(id)
    .retrieve()) as Document

  const updatedImages = (document.images || []).filter(
    (img: string) => img !== image
  )

  await typesense
    .collections(collectionName)
    .documents(id)
    .update({ images: updatedImages })
}

export async function deleteTypesenseType(productType: string) {
  await typesense
    .collections(collectionName)
    .documents()
    .delete({ filter_by: `type:=${productType}` })
}
