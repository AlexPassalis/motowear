import { ReactNode } from 'react'
import { Footer } from '@/components/Footer'

export default async function UserLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
