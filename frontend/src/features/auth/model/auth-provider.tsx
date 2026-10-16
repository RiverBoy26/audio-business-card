import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
  uploadAvatar as uploadAvatarRequest,
  type CurrentUser,
} from '@/features/auth/model/auth-api'
import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/model/use-auth'
import {
  clearTokens,
  getRefreshToken,
  saveTokens,
} from '@/shared/api/auth-storage'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [avatarRevision, setAvatarRevision] = useState(0)
  const [isReady, setIsReady] = useState(() => !getRefreshToken())

  useEffect(() => {
    if (!getRefreshToken()) return

    void getCurrentUser()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setIsReady(true))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      avatarRevision,
      isReady,
      user,
      login: async (email, password) => {
        const response = await loginRequest(email, password)
        saveTokens(response)
        setUser(response.user)
      },
      register: async (payload) => {
        const response = await registerRequest(payload)
        saveTokens(response)
        setUser(response.user)
      },
      uploadAvatar: async (file) => {
        setUser(await uploadAvatarRequest(file))
        setAvatarRevision((revision) => revision + 1)
      },
      updateProfile: async (payload) => {
        setUser(await updateProfileRequest(payload))
      },
      logout: async () => {
        const refreshToken = getRefreshToken()

        try {
          if (refreshToken) await logoutRequest(refreshToken)
        } finally {
          clearTokens()
          setUser(null)
        }
      },
    }),
    [avatarRevision, isReady, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
