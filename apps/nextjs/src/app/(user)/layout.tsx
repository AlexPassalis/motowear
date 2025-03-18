import { ReactNode } from 'react'
import { getProductTypes } from '@/utils/getPostgres'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default async function UserLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}
