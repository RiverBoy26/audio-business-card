import { describe, expect, it } from 'vitest'

import { formatDuration, normalizeDuration } from './format-duration'

describe('formatDuration', () => {
  it('shows only whole minutes and seconds', () => {
    expect(formatDuration(88.987654321)).toBe('1:28')
  })

  it('handles invalid and negative values', () => {
    expect(formatDuration(Number.NaN)).toBe('0:00')
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('0:00')
    expect(formatDuration(-4.2)).toBe('0:00')
  })

  it('uses a known recording duration while browser metadata is infinite', () => {
    expect(normalizeDuration(Number.POSITIVE_INFINITY, 17)).toBe(17)
  })
})
