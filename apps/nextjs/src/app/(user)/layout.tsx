import { ReactNode } from 'react'
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
