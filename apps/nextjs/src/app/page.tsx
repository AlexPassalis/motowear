import { getProductTypes } from '@/utils/getPostgres'
import { Header } from '@/components/Header'

export default async function HomePage() {
  const productTypes = await getProductTypes()

  return (
    <>
      <Header productTypes={productTypes} />
    </>
  )
}
