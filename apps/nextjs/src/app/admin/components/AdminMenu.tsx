import {
  ROUTE_ADMIN,
  ROUTE_ADMIN_EMAIL,
  ROUTE_ADMIN_ORDER,
  ROUTE_ADMIN_PHONE,
  ROUTE_ADMIN_PRODUCT,
} from '@/data/routes'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'
import { AiOutlineClose } from 'react-icons/ai'

type MenuProps = {
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
}

export function AdminMenu({ isMenuOpen, setIsMenuOpen }: MenuProps) {
  return (
    <section
      className={`z-20 fixed top-0 left-0 w-3/4 max-w-[365px] h-full overflow-y-auto bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 border-[var(--mantine-border)]">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex ml-auto justify-center items-center h-10 w-10 rounded-md border border-[var(--mantine-border)] transition-colors hover:cursor-pointer group"
          >
            <AiOutlineClose className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl">
            Περιήγηση
          </h1>
        </div>
        <nav>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href={ROUTE_ADMIN} className="text-xl hover:text-red-500">
                Dashboard
              </Link>
            </li>
            <hr className="w-full border-t border-[var(--mantine-border)]" />
            <li>
              <Link
                href={ROUTE_ADMIN_PRODUCT}
                className="text-xl hover:text-red-500"
              >
                Pages
              </Link>
            </li>
            <hr className="w-full border-t border-[var(--mantine-border)]" />
            <li>
              <Link
                href={ROUTE_ADMIN_ORDER}
                className="text-xl hover:text-red-500"
              >
                Orders
              </Link>
            </li>
            <hr className="w-full border-t border-[var(--mantine-border)]" />
            <li>
              <Link
                href={ROUTE_ADMIN_EMAIL}
                className="text-xl hover:text-red-500"
              >
                Email list
              </Link>
            </li>
            <hr className="w-full border-t border-[var(--mantine-border)]" />
            <li>
              <Link
                href={ROUTE_ADMIN_PHONE}
                className="text-xl hover:text-red-500"
              >
                Phone list
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  )
}
