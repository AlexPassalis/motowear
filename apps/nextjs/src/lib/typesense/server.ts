import Typesense from 'typesense'
import { getVariantsProductType } from '@/utils/getPostgres'
import { envServer } from '@/env'
import { formatMessage } from '@/utils/formatMessage'
import { v4 as id } from 'uuid'
import { errorPostgres, errorTypesense } from '@/data/error'
import { sendTelegramMessage } from '../telegram'
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
    console.log(`Collection ${collectionName} not found. Creating it.`)
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
    console.log(`Collection ${collectionName} created successfully.`)
  }

  const limit = pLimit(10)
  const resolved = await Promise.allSettled([
    limit(() => getVariantsProductType(product_type)),
    limit(() =>
      typesense
        .collections(collectionName)
        .documents()
        .delete({ filter_by: `product_type:=${product_type}` })
    ),
  ])

  if (resolved[0].status === 'rejected') {
    const message = formatMessage(
      id(),
      '@/lib/typesense/server.ts updateTypesense()',
      errorPostgres,
      resolved[0].reason
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }

  if (resolved[1].status === 'rejected') {
    const message = formatMessage(
      id(),
      '@/lib/typesense/server.ts updateTypesense() delete',
      errorTypesense,
      resolved[1].reason
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorTypesense
  }

  const upsertedVersions = [] as string[]
  for (const variant of resolved[0].value) {
    if (!upsertedVersions.includes(variant.variant)) {
      const document = {
        id: variant.id,
        product_type: variant.product_type,
        variant: variant.variant,
        image: variant.images[0],
      }
      try {
        await typesense.collections(collectionName).documents().upsert(document)
      } catch (e) {
        const message = formatMessage(
          id(),
          '@/lib/typesense/server.ts updateTypesense() upsert',
          errorTypesense,
          e
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorTypesense
      }
      upsertedVersions.push(variant.variant)
    }
  }
}
