import { createContext, useContext } from 'react'

import type {
  CurrentUser,
  RegisterPayload,
} from '@/features/auth/model/auth-api'

export type AuthContextValue = {
  isReady: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  user: CurrentUser | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
