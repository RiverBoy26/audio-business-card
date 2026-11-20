import { createContext, useContext } from 'react'

import type {
  CurrentUser,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/features/auth/model/auth-api'

export type AuthContextValue = {
  avatarRevision: number
  isReady: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  user: CurrentUser | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
