import { z } from 'zod'

import { apiRequest } from '@/shared/api/api-client'

const voiceRecordingSchema = z.object({
  id: z.string().uuid(),
  originalFilename: z.string(),
  contentType: z.string(),
  size: z.number(),
  durationSeconds: z.number().int().min(0),
  processingStatus: z.string(),
  createdAt: z.string(),
  fileUrl: z.string(),
})

export type VoiceRecording = z.infer<typeof voiceRecordingSchema>

export function getVoiceRecordings() {
  return apiRequest<VoiceRecording[]>('/api/voice-recordings', {
    schema: z.array(voiceRecordingSchema),
  })
}

export function uploadVoiceRecording(file: File, durationSeconds: number) {
  const form = new FormData()
  form.append('file', file)
  form.append('durationSeconds', String(durationSeconds))
  return apiRequest<VoiceRecording>('/api/voice-recordings', {
    method: 'POST',
    body: form,
    schema: voiceRecordingSchema,
  })
}

export function getVoiceRecordingBlob(recording: VoiceRecording) {
  return apiRequest<Blob>(recording.fileUrl, { responseType: 'blob' })
}
