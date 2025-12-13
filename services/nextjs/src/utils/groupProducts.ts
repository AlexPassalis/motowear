import type { ProductWithCollectionName, ProductNameGroup } from '@/lib/postgres/data/type'

export function group_products_by_name(products: ProductWithCollectionName[]): ProductNameGroup[] {
  const groups_map = new Map<string, ProductWithCollectionName[]>()

  for (const product of products) {
    if (!groups_map.has(product.name)) {
      groups_map.set(product.name, [])
    }
    groups_map.get(product.name)!.push(product)
  }

  return Array.from(groups_map.entries()).map(([name, group_products]) => ({
    name,
    color_count: group_products.length,
    product_ids: group_products.map(p => p.id),
    collection_id: group_products[0].collection_id,
  }))
}
