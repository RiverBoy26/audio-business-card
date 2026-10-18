import { describe, expect, it } from 'vitest'

import { initialCardDraft } from '@/entities/audio-card/model/types'

describe('card volume defaults', () => {
  it('starts voice at the slider midpoint and music at its visible maximum', () => {
    expect(initialCardDraft.voiceVolume).toBe(100)
    expect(initialCardDraft.musicVolume).toBe(100)
  })
})
