// Tells search engines to not index and follow links on this page.
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
