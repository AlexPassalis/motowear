import Typesense from 'typesense'
import { getProductPostgres } from '@/utils/getPostgres'

const typesense = new Typesense.Client({
  nodes: [{ host: 'typesense', port: 8108, protocol: 'http' }],
  apiKey: 'dev-xyz',
})

const collectionName = 'product'

export async function updateTypesense() {
  const productPostgres = await getProductPostgres()

  try {
    await typesense.collections(collectionName).retrieve()
    console.log('Collection exists.')
  } catch (err) {
    console.log('Collection not found. Creating a new one...')
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
        { name: 'sizes', type: 'string[]' as const },
        { name: 'price_before', type: 'float' as const },
      ],
    }
    await typesense.collections().create(schema)
    console.log('Collection created.')
  }

  for (const productType in productPostgres) {
    const products = productPostgres[productType]
    for (const product of products) {
      product.type = productType

      try {
        const result = await typesense
          .collections(collectionName)
          .documents()
          .upsert(product)
        console.log(`Upserted product ${product.id}:`, result)
      } catch (err) {
        console.error(`Error upserting product ${product.id}:`, err)
      }
    }
  }
}

export async function deleteTypesenseVersion(id: string) {
  await typesense.collections(collectionName).documents(id).delete()
}

export async function deleteTypesenseImage(id: string, image: string) {
  const document = await typesense
    .collections(collectionName)
    .documents(id)
    .retrieve()

  const updatedImages = (document?.images || []).filter(
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
