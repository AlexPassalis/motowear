import Typesense from 'typesense'
import { getVariantsProductType } from '@/utils/getPostgres'
import { envServer } from '@/envServer'
import { handleError } from '@/utils/error/handleError'
import pLimit from 'p-limit'

const typesense = new Typesense.Client({
  nodes: [{ host: 'typesense', port: 8108, protocol: 'http' }],
  apiKey: envServer.TYPESENSE_ADMIN_API_KEY,
})

const collectionName = 'product'

export async function updateTypesense(product_type: string) {
  try {
    await typesense.collections(collectionName).retrieve()
  } catch {
    console.info(`Collection ${collectionName} not found. Creating it.`)
    const schema = {
      name: collectionName,
      fields: [
        { name: 'id', type: 'string' as const },
        { name: 'product_type', type: 'string' as const, tokenize: 'ngram' },
        { name: 'variant', type: 'string' as const, tokenize: 'ngram' },
        { name: 'image', type: 'string' as const },
      ],
    }
    await typesense.collections().create(schema)
    console.info(`Collection ${collectionName} created successfully.`)
  }

  const limit = pLimit(10)
  const resolved = await Promise.allSettled([
    limit(() => getVariantsProductType(product_type)),
    limit(() =>
      typesense
        .collections(collectionName)
        .documents()
        .delete({ filter_by: `product_type:=\`${product_type}\`` }),
    ),
  ])

  if (resolved[0].status === 'rejected') {
    const location = '@/lib/typesense/server.ts updateTypesense() postgres'
    handleError(location, resolved[0].reason)

    throw resolved[0].reason
  }

  if (resolved[1].status === 'rejected') {
    const location = '@/lib/typesense/server.ts updateTypesense() delete'
    handleError(location, resolved[1].reason)

    throw resolved[1].reason
  }

  const upsertedVersions = [] as string[]
  for (const variant of resolved[0].value) {
    if (!upsertedVersions.includes(variant.name)) {
      const document = {
        id: variant.id,
        product_type: variant.product_type,
        variant: variant.name,
        image: variant.image,
      }
      try {
        await typesense.collections(collectionName).documents().upsert(document)
      } catch (err) {
        const location = '@/lib/typesense/server.ts updateTypesense() upsert'
        handleError(location, err)

        throw err
      }
      upsertedVersions.push(variant.name)
    }
  }
}

export async function deleteTypesense(product_type: string) {
  const limit = pLimit(10)
  await Promise.all([
    limit(() =>
      typesense
        .collections(collectionName)
        .documents()
        .delete({ filter_by: `product_type:=\`${product_type}\`` }),
    ),
  ])
}
