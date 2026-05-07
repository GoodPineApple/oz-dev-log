import { createContext } from 'react'

export const ToastContext = createContext<{
  show: (message: string) => void
} | null>(null)
