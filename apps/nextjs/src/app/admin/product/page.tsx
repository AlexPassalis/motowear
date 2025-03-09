import { AdminProductClientPage } from '@/app/admin/product/client'
import { getProductPostgres } from '@/utils/getProductPostgres'

export default async function AdminProductPage() {
  const productPostgres = await getProductPostgres()

  return <AdminProductClientPage productPostgres={productPostgres} />
}
