import { z } from 'zod'

import { apiRequest } from '@/shared/api/api-client'

const voiceProfileSchema = z.object({
  transcript: z.string(),
  sphere: z.string().nullable(),
  specialization: z.string().nullable(),
  skills: z.array(z.string()),
  experience: z.object({
    minMonths: z.number().int().min(0),
    maxMonths: z.number().int().min(0),
    raw: z.string(),
  }).nullable(),
  desiredPosition: z.string().nullable(),
  unknownSkills: z.array(z.string()),
  issues: z.array(z.string()),
  requiresConfirmation: z.boolean(),
})

export type VoiceProfile = z.infer<typeof voiceProfileSchema>

export function processVoiceProfile(file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiRequest<VoiceProfile>('/api/voice-profile', {
    method: 'POST',
    body: form,
    schema: voiceProfileSchema,
  })
}
