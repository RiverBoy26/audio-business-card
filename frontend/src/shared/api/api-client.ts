import { z } from 'zod'

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '@/shared/api/auth-storage'
import { env } from '@/shared/config/env'

const errorPayloadSchema = z.object({
  message: z.string().optional(),
})

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiRequestOptions<T> = Omit<RequestInit, 'body'> & {
  auth?: boolean
  body?: BodyInit
  json?: unknown
  responseType?: 'blob' | 'json' | 'void'
  schema?: z.ZodType<T>
}

function createUrl(path: string) {
  const baseUrl = env.VITE_API_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

async function readError(response: Response) {
  const fallback = `Запрос завершился с ошибкой ${response.status}`
  if (response.status === 413) {
    return 'Запись слишком большая для отправки. Сделайте её короче и попробуйте снова.'
  }
  const contentType = response.headers.get('content-type') ?? ''

  try {
    if (!contentType.includes('application/json')) {
      return (await response.text()).trim() || fallback
    }

    const payload = errorPayloadSchema.safeParse(await response.json())

    return payload.success && payload.data.message
      ? payload.data.message
      : fallback
  } catch {
    return fallback
  }
}

const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) throw new ApiError('Требуется повторный вход', 401)

  const response = await fetch(createUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearTokens()
    throw new ApiError(await readError(response), response.status)
  }

  const tokens = refreshResponseSchema.parse(await response.json())
  saveTokens(tokens)
  return tokens.accessToken
}

function getRefreshedAccessToken() {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

async function parseResponse<T>(
  response: Response,
  responseType: ApiRequestOptions<T>['responseType'],
  schema?: z.ZodType<T>,
) {
  if (responseType === 'void' || response.status === 204) return undefined as T
  if (responseType === 'blob') return (await response.blob()) as T

  const payload: unknown = await response.json()
  return schema ? schema.parse(payload) : (payload as T)
}

export async function apiRequest<T>(
  path: string,
  {
    auth = true,
    body,
    headers,
    json,
    responseType = 'json',
    schema,
    ...init
  }: ApiRequestOptions<T>,
) {
  const makeRequest = (accessToken: string | null) =>
    fetch(createUrl(path), {
      ...init,
      body: json === undefined ? body : JSON.stringify(json),
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(json === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
        Accept: responseType === 'blob' ? '*/*' : 'application/json',
      },
    })

  let response = await makeRequest(auth ? getAccessToken() : null)

  if (auth && response.status === 401 && getRefreshToken()) {
    const accessToken = await getRefreshedAccessToken()
    response = await makeRequest(accessToken)
  }

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status)
  }

  return parseResponse(response, responseType, schema)
}
