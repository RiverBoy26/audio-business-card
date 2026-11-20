import { z } from 'zod'

import { apiRequest } from '@/shared/api/api-client'

const musicSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  originalFilename: z.string(),
  contentType: z.string(),
  size: z.number(),
  uploadedAt: z.string(),
  fileUrl: z.string(),
  system: z.boolean().default(false),
})

export type MusicFile = z.infer<typeof musicSchema>

export function getMusicFiles() {
  return apiRequest<MusicFile[]>('/api/music', {
    schema: z.array(musicSchema),
  })
}

export function uploadMusic(file: File) {
  const form = new FormData()
  form.append('file', file)

  return apiRequest<MusicFile>('/api/music/upload', {
    method: 'POST',
    body: form,
    schema: musicSchema,
  })
}

export function getMusicBlob(file: MusicFile) {
  return apiRequest<Blob>(file.fileUrl, { responseType: 'blob' })
}

export function deleteMusic(id: string) {
  return apiRequest<void>(`/api/music/${id}`, {
    method: 'DELETE',
    responseType: 'void',
  })
}
