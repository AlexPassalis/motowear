import { env } from '@/env'
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'

export const typesenseClient = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: 'dev-xyz',
    nodes: [
      {
        port: 443,
        protocol: 'https',
        host: env.HOST,
        path: '/typesense',
      },
    ],
  },
  additionalSearchParameters: {
    query_by: 'type,version,brand,color,sizes',
  },
})
