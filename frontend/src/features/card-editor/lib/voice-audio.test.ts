import { describe, expect, it } from 'vitest'

import { clampTrimEnd, clampTrimStart } from '@/features/card-editor/lib/voice-audio'

describe('voice trim range', () => {
  it('does not allow the start to reach or pass the end', () => {
    expect(clampTrimStart(8, 5)).toBe(4)
  })

  it('does not allow the end to reach or precede the start', () => {
    expect(clampTrimEnd(2, 3, 6)).toBe(4)
  })
})
