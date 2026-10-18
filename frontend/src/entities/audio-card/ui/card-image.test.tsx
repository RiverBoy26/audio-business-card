import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CardImage } from '@/entities/audio-card/ui/card-image'
import { getCardPhotoBlob } from '@/entities/audio-card/api/audio-card-api'

vi.mock('@/entities/audio-card/api/audio-card-api', () => ({
  getCardPhotoBlob: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CardImage', () => {
  it('shows the selected profile avatar without using the card photo proxy', () => {
    render(<CardImage alt="Аватар" src="/api/v1/auth/users/123/avatar" />)

    expect(screen.getByRole('img', { name: 'Аватар' })).toHaveAttribute('src', '/api/v1/auth/users/123/avatar')
    expect(getCardPhotoBlob).not.toHaveBeenCalled()
  })

  it('stops showing a loading animation when a protected photo is unavailable', async () => {
    vi.mocked(getCardPhotoBlob).mockRejectedValue(new Error('Файл не найден'))
    render(<CardImage alt="Фото кандидата" src="/api/v1/applications/123/card/photo" />)

    expect(await screen.findByRole('img', { name: 'Фото кандидата' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Фото кандидата')).not.toHaveClass('animate-pulse')
  })

  it('shows a fallback when a profile avatar is unavailable', () => {
    render(<CardImage alt="Аватар" src="/api/v1/auth/users/123/avatar" />)
    fireEvent.error(screen.getByRole('img', { name: 'Аватар' }))

    expect(screen.getByRole('img', { name: 'Аватар' }).tagName).toBe('SPAN')
  })
})
