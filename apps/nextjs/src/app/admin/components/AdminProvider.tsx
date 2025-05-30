import { ReactNode, useState } from 'react'

import { AdminMenu } from '@/app/admin/components/AdminMenu'
import { AiOutlineMenu } from 'react-icons/ai'

type AdminProviderProps = {
  children: ReactNode
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <AdminMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div
        onClick={() => {
          if (isMenuOpen) setIsMenuOpen(false)
        }}
        className="relative min-h-screen flex flex-col z-10 w-full h-full"
      >
        <div className="absolute top-3 left-3 z-20 bg-white">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex justify-center items-center h-10 w-10 xl:scale-110 rounded-md border border-[var(--mantine-border)] transition-colors hover:cursor-pointer group"
          >
            <AiOutlineMenu className="transition-transform duration-200 ease-in-out group-hover:scale-110" />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
