import Image from 'next/image'

export default async function AdminPage() {
  const imageUrl =
    'http://minio:9000/product/helmet/default/There_is_nothing_imposible_to_him_who_will_try_-_Alexander_the_Great.png'

  return (
    <>
      <h1>Admin</h1>
      <Image src={imageUrl} alt="Product Image" width={500} height={500} />
    </>
  )
}
