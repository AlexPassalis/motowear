import { useContext as useContextHook } from 'react'
import { Context } from '@/app/admin/product/client/context/Provider'

export function useContext() {
  const value = useContextHook(Context)
  if (value === null) {
    throw new Error('useContext must be used within ContextProvider')
  }
  return value
}
