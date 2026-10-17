import { describe, expect, it } from 'vitest'

import { pluralizeRu } from './pluralize-ru'

describe('pluralizeRu', () => {
  it.each([
    [0, 'карточек'],
    [1, 'карточка'],
    [2, 'карточки'],
    [4, 'карточки'],
    [5, 'карточек'],
    [11, 'карточек'],
    [21, 'карточка'],
    [24, 'карточки'],
    [25, 'карточек'],
  ])('selects the correct form for %i', (count, expected) => {
    expect(pluralizeRu(count, 'карточка', 'карточки', 'карточек')).toBe(expected)
  })
})
