import { useContext } from 'react'
import { HeaderContext } from '@/context/HeaderProvider'

export function useHeaderContext() {
  const value = useContext(HeaderContext)
  if (value === null) {
    throw new Error(
      'useHeaderContext must be used within HeaderProvider Context',
    )
  }
  return value
}
