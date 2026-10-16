import { z } from 'zod'

import { apiRequest } from '@/shared/api/api-client'

export const userSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().nullable(),
  birthDate: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: z.enum(['USER', 'ADMIN']),
  avatarUrl: z.string().nullable(),
})

export type CurrentUser = z.infer<typeof userSchema>

const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  tokenType: z.string(),
  expiresIn: z.number(),
  user: userSchema,
})

export type AuthResponse = z.infer<typeof authResponseSchema>

export type RegisterPayload = {
  birthDate: string
  email: string
  firstName: string
  lastName: string
  middleName: string | null
  password: string
  phone: string
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    auth: false,
    json: { email, password },
    schema: authResponseSchema,
  })
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    auth: false,
    json: payload,
    schema: authResponseSchema,
  })
}

export function getCurrentUser() {
  return apiRequest<CurrentUser>('/api/v1/auth/me', { schema: userSchema })
}

export function uploadAvatar(file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiRequest<CurrentUser>('/api/v1/auth/me/avatar', {
    method: 'POST',
    body: form,
    schema: userSchema,
  })
}

export function logout(refreshToken: string) {
  return apiRequest<void>('/api/v1/auth/logout', {
    method: 'POST',
    auth: false,
    json: { refreshToken },
    responseType: 'void',
  })
}
