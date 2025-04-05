import Typesense from 'typesense'
import { getAllVariants, getVariants } from '@/utils/getPostgres'
import { envServer } from '@/env'
import { formatMessage } from '@/utils/formatMessage'
import { v4 as id } from 'uuid'
import { errorPostgres, errorTypesense } from '@/data/error'
import { sendTelegramMessage } from '../telegram'
import { NextResponse } from 'next/server'
import pLimit from 'p-limit'

const typesense = new Typesense.Client({
  nodes: [{ host: 'typesense', port: 8108, protocol: 'http' }],
  apiKey: envServer.TYPESENSE_ADMIN_API_KEY,
})

const collectionName = 'product'

export async function updateTypesense() {
  const variantsPostgres = await getAllVariants()

  try {
    await typesense.collections(collectionName).retrieve()
  } catch {
    console.log(`Collection ${collectionName} not found. Creating it ...`)
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

  const upsertedVersions = [] as string[]
  for (const variant of variantsPostgres) {
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
          '@/lib/typesense/server.ts updateTypesense()',
          errorTypesense,
          e
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      }
      upsertedVersions.push(variant.variant)
    }
  }
}

export async function updateTypesenseProductType(product_type: string) {
  const limit = pLimit(10)
  const resolved = await Promise.allSettled([
    limit(() => getVariants(product_type)),
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
      '@/lib/typesense/server.ts updateTypesenseProductType()',
      errorPostgres,
      resolved[0].reason
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  if (resolved[1].status === 'rejected') {
    const message = formatMessage(
      id(),
      '@/lib/typesense/server.ts updateTypesenseProductType() 1',
      errorTypesense,
      resolved[1].reason
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorTypesense }, { status: 500 })
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
          '@/lib/typesense/server.ts updateTypesenseProductType() 2',
          errorTypesense,
          e
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      }
      upsertedVersions.push(variant.variant)
    }
  }
}
