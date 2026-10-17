import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AudioCard } from '@/entities/audio-card/model/types'
import { AudioCardItem } from '@/entities/audio-card/ui/audio-card-item'

afterEach(cleanup)

const card: AudioCard = {
  contactEmail: null,
  contactPhone: null,
  description: 'Бэкенд-разработчик',
  documentName: null,
  documentUrl: null,
  fullName: 'Марк Соколов',
  id: 'bf90cf29-d6aa-4240-b8e4-a86572d472da',
  musicId: null,
  photoUrl: null,
  published: true,
  publishedAt: '2026-10-17T12:00:00',
  publicCode: '6ERRHG',
  skills: [],
  title: 'Марк Соколов',
  voiceRecordingId: null,
}

describe('AudioCardItem', () => {
  it('shows the public code instead of the internal id for a published card', () => {
    render(
      <MemoryRouter>
        <AudioCardItem card={card} deleting={false} onDelete={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByText('6ERRHG')).toBeInTheDocument()
    expect(screen.queryByText(/bf90cf29/i)).not.toBeInTheDocument()
  })

  it('marks an unpublished card as a draft without exposing its internal id', () => {
    render(
      <MemoryRouter>
        <AudioCardItem
          card={{ ...card, published: false, publishedAt: null, publicCode: null }}
          deleting={false}
          onDelete={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Черновик')).toBeInTheDocument()
    expect(screen.queryByText(/bf90cf29/i)).not.toBeInTheDocument()
  })
})
