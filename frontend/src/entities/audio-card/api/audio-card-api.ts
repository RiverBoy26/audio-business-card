import { z } from 'zod'

import type {
  AudioCard,
  CardDraft,
  PublicAudioCard,
} from '@/entities/audio-card/model/types'
import { apiRequest } from '@/shared/api/api-client'

const audioCardSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  published: z.boolean(),
  publishedAt: z.string().nullable(),
  publicCode: z.string().regex(/^[A-Z0-9]{6}$/).nullable(),
  title: z.string(),
  description: z.string().nullable(),
  documentName: z.string().nullable(),
  documentUrl: z.string().nullable(),
  photoUrl: z.string().nullable(),
  musicId: z.string().uuid().nullable(),
  voiceRecordingId: z.string().uuid().nullable(),
  skills: z.array(z.string()).default([]),
})

const publicAudioCardSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  documentName: z.string().nullable(),
  documentUrl: z.string().nullable(),
  photoUrl: z.string().nullable(),
  skills: z.array(z.string()).default([]),
  experienceYears: z.number().int().min(0),
  voiceVolume: z.number().int().min(0).max(100),
  musicVolume: z.number().int().min(0).max(100),
  musicStartSeconds: z.number().int().min(0).default(0),
  voiceUrl: z.string().nullable(),
  musicUrl: z.string().nullable(),
  publishedAt: z.string().nullable(),
  publicCode: z.string().regex(/^[A-Z0-9]{6}$/).nullable(),
})

const experienceSchema = z.object({
  cardId: z.string().uuid(),
  experienceYears: z.number().int().min(0).max(80),
})

const settingsSchema = z.object({
  cardId: z.string().uuid(),
  voiceVolume: z.number().int().min(0).max(100),
  musicVolume: z.number().int().min(0).max(100),
  musicStartSeconds: z.number().int().min(0).default(0),
})

export function getAudioCards() {
  return apiRequest<AudioCard[]>('/audio-cards', {
    schema: z.array(audioCardSchema),
  })
}

export function getAudioCard(id: string) {
  return apiRequest<AudioCard>(`/audio-cards/${id}`, {
    schema: audioCardSchema,
  })
}

export function createAudioCard(draft: CardDraft) {
  return apiRequest<AudioCard>('/audio-cards', {
    method: 'POST',
    json: {
      title: draft.title,
      fullName: draft.fullName || null,
      contactEmail: draft.showContactEmail ? draft.contactEmail || null : null,
      contactPhone: draft.showContactPhone ? draft.contactPhone || null : null,
      description: draft.description || null,
      photoUrl: draft.photoFile ? null : draft.photoUrl || null,
      skills: draft.skills,
      musicId: draft.musicId,
      voiceRecordingId: draft.voiceRecordingId,
    },
    schema: audioCardSchema,
  })
}

export function updateAudioCard(id: string, draft: CardDraft) {
  return apiRequest<AudioCard>(`/audio-cards/${id}`, {
    method: 'PATCH',
    json: {
      title: draft.title,
      fullName: draft.fullName || null,
      contactEmail: draft.showContactEmail ? draft.contactEmail || null : null,
      contactPhone: draft.showContactPhone ? draft.contactPhone || null : null,
      description: draft.description,
      photoUrl: draft.photoFile ? undefined : draft.photoUrl,
      skills: draft.skills,
      musicId: draft.musicId,
      voiceRecordingId: draft.voiceRecordingId,
    },
    schema: audioCardSchema,
  })
}

export function deleteAudioCard(id: string) {
  return apiRequest<void>(`/audio-cards/${id}`, {
    method: 'DELETE',
    responseType: 'void',
  })
}

export function uploadCardPhoto(id: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiRequest<AudioCard>(`/audio-cards/${id}/photo`, {
    method: 'POST',
    body: form,
    schema: audioCardSchema,
  })
}

export function getCardPhotoBlob(url: string) {
  return apiRequest<Blob>(url, { responseType: 'blob' })
}

export function uploadCardDocument(id: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiRequest<AudioCard>(`/audio-cards/${id}/document`, {
    method: 'POST',
    body: form,
    schema: audioCardSchema,
  })
}

export function getCardDocumentBlob(url: string) {
  return apiRequest<Blob>(url, { responseType: 'blob' })
}

export function deleteCardDocument(id: string) {
  return apiRequest<AudioCard>(`/audio-cards/${id}/document`, {
    method: 'DELETE',
    schema: audioCardSchema,
  })
}

export async function getCardDraft(id: string): Promise<CardDraft> {
  const [card, experience, settings] = await Promise.all([
    getAudioCard(id),
    apiRequest<z.infer<typeof experienceSchema>>(
      `/audio-cards/${id}/experience`,
      { schema: experienceSchema },
    ),
    apiRequest<z.infer<typeof settingsSchema>>(`/audio-cards/${id}/settings`, {
      schema: settingsSchema,
    }),
  ])

  return {
    title: card.title,
    description: card.description ?? '',
    documentFile: null,
    documentName: card.documentName,
    documentUrl: card.documentUrl,
    fullName: card.fullName ?? '',
    contactEmail: card.contactEmail ?? '',
    contactPhone: card.contactPhone ?? '',
    published: card.published,
    publicCode: card.publicCode,
    photoUrl: card.photoUrl ?? '',
    photoFile: null,
    showContactEmail: Boolean(card.contactEmail),
    showContactPhone: Boolean(card.contactPhone),
    cardType: card.cardType,
    experienceYears: experience.experienceYears,
    skills: card.skills,
    voiceVolume: settings.voiceVolume,
    musicVolume: settings.musicVolume,
    musicStartSeconds: settings.musicStartSeconds,
    musicId: card.musicId,
    voiceRecordingId: card.voiceRecordingId,
  }
}

export async function saveCardDraft(draft: CardDraft, id?: string) {
  let card = id
    ? await updateAudioCard(id, draft)
    : await createAudioCard(draft)

  await Promise.all([
    apiRequest(`/audio-cards/${card.id}/experience`, {
      method: 'PUT',
      json: { experienceYears: draft.experienceYears },
      schema: experienceSchema,
    }),
    apiRequest(`/audio-cards/${card.id}/settings`, {
      method: 'PATCH',
      json: {
        voiceVolume: draft.voiceVolume,
        musicVolume: draft.musicVolume,
        musicStartSeconds: draft.musicStartSeconds,
      },
      schema: settingsSchema,
    }),
  ])

  if (draft.photoFile) {
    card = await uploadCardPhoto(card.id, draft.photoFile)
  }

  if (draft.documentFile) {
    card = await uploadCardDocument(card.id, draft.documentFile)
  }

  return card
}

export function publishAudioCard(id: string) {
  return apiRequest<AudioCard>(`/audio-cards/${id}/publish`, {
    method: 'POST',
    schema: audioCardSchema,
  })
}

export function unpublishAudioCard(id: string) {
  return apiRequest<AudioCard>(`/audio-cards/${id}/publication`, {
    method: 'DELETE',
    schema: audioCardSchema,
  })
}

export function getPublicAudioCard(id: string) {
  return apiRequest<PublicAudioCard>(`/public/audio-cards/${id}`, {
    auth: false,
    schema: publicAudioCardSchema,
  })
}

export function getPublicAudioCardByCode(code: string) {
  return apiRequest<PublicAudioCard>(`/public/audio-cards/code/${code}`, {
    auth: false,
    schema: publicAudioCardSchema,
  })
}

export function getApplicationAudioCard(applicationId: string) {
  return apiRequest<PublicAudioCard>(`/api/v1/applications/${applicationId}/card`, {
    schema: publicAudioCardSchema,
  })
}

export function getPublicCardMedia(url: string) {
  return apiRequest<Blob>(url, {
    auth: url.startsWith('/api/v1/applications/'),
    responseType: 'blob',
  })
}
