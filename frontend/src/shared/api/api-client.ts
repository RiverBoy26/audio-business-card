import { z } from 'zod'

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
  body?: unknown
  schema: z.ZodType<T>
}

function createUrl(path: string) {
  const baseUrl = env.VITE_API_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

async function readError(response: Response) {
  const fallback = `Запрос завершился с ошибкой ${response.status}`

  try {
    const payload = errorPayloadSchema.safeParse(await response.json())

    return payload.success && payload.data.message
      ? payload.data.message
      : fallback
  } catch {
    return fallback
  }
}

export async function apiRequest<T>(
  path: string,
  { body, headers, schema, ...init }: ApiRequestOptions<T>,
) {
  const response = await fetch(createUrl(path), {
    ...init,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status)
  }

  return schema.parse(await response.json())
}
