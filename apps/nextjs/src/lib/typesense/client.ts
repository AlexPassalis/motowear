import { envClient } from '@/env'
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'

export const typesenseClient = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: envClient.TYPESENSE_SEARCH_ONLY_API_KEY,
    nodes: [
      {
        protocol: 'https',
        host: envClient.HOST,
        port: 443,
        path: '/typesense',
      },
    ],
  },
  additionalSearchParameters: {
    query_by: 'product_type,variant',
    highlight_full_fields: '*',
    prefix: true,
    // infix: 'always',
  },
})
