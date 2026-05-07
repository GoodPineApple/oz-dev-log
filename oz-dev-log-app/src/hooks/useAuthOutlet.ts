import { useOutletContext } from 'react-router-dom'
import type { User } from '../types'

export type AuthOutletContext = { user: User }

export function useAuthOutlet() {
  return useOutletContext<AuthOutletContext>()
}
