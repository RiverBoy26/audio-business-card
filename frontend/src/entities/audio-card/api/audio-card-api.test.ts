import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAudioCard } from '@/entities/audio-card/api/audio-card-api'
import { initialCardDraft } from '@/entities/audio-card/model/types'

afterEach(() => vi.unstubAllGlobals())

describe('createAudioCard', () => {
  it('sends only contacts selected for the card', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      contactEmail: null,
      contactPhone: '+79001234567',
      description: null,
      documentName: null,
      documentUrl: null,
      fullName: 'Марк Соколов',
      id: 'bf90cf29-d6aa-4240-b8e4-a86572d472da',
      musicId: null,
      photoUrl: null,
      published: false,
      publishedAt: null,
      publicCode: null,
      skills: ['Python', 'FastAPI'],
      title: 'Разработчик',
      voiceRecordingId: null,
    }), { headers: { 'Content-Type': 'application/json' }, status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await createAudioCard({
      ...initialCardDraft,
      contactEmail: 'mark@example.ru',
      contactPhone: '+79001234567',
      fullName: 'Марк Соколов',
      showContactEmail: false,
      showContactPhone: true,
      title: 'Разработчик',
    })

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(JSON.parse(String(request.body))).toMatchObject({
      contactEmail: null,
      contactPhone: '+79001234567',
    })
  })
})
