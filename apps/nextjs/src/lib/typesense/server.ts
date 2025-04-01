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
        { name: 'id', type: 'string' as const },
        { name: 'type', type: 'string' as const, tokenize: 'ngram' },
        { name: 'version', type: 'string' as const, tokenize: 'ngram' },
        { name: 'image', type: 'string' as const },
      ],
    }
    await typesense.collections().create(schema)
    console.log(`Collection ${collectionName} created successfully.`)
  }

  for (const productType in productPostgres) {
    const products = productPostgres[productType]
    const upsertedVersions = [] as string[]
    for (const product of products) {
      if (!upsertedVersions.includes(product.version)) {
        const document = {
          id: product.id,
          type: productType,
          version: product.version,
          image: product.images[0],
        }
        try {
          await typesense
            .collections(collectionName)
            .documents()
            .upsert(document)
        } catch (e) {
          console.error(`Error upserting product ${product.id}:`, e)
        }
        upsertedVersions.push(product.version)
      }
    }
  }
}

export type Document = {
  id: string
  type: string
  version: string
  image: string
}

export async function deleteTypesenseVersion(id: string) {
  await typesense.collections(collectionName).documents(id).delete()
}

// export async function deleteTypesenseImage(id: string, image: string) {
//   const document = (await typesense
//     .collections(collectionName)
//     .documents(id)
//     .retrieve()) as Document

//   const updatedImages = (document.image || []).filter(
//     (img: string) => img !== image
//   )

//   await typesense
//     .collections(collectionName)
//     .documents(id)
//     .update({ images: updatedImages })
// }

export async function deleteTypesenseType(productType: string) {
  await typesense
    .collections(collectionName)
    .documents()
    .delete({ filter_by: `type:=${productType}` })
}
