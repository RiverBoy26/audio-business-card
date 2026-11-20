import { describe, expect, it } from 'vitest'

import type { MusicFile } from '@/entities/music/api/music-api'

import { uniqueMusicFiles } from './unique-music-files'

function music(id: string, uploadedAt: string): MusicFile {
  return {
    contentType: 'audio/mpeg',
    fileUrl: `/api/music/${id}/file`,
    id,
    originalFilename: 'breaking-bad-intro.mp3',
    size: 2048,
    system: false,
    uploadedAt,
    userId: '00000000-0000-4000-8000-000000000001',
  }
}

describe('uniqueMusicFiles', () => {
  it('hides duplicate uploads and keeps the newest one', () => {
    const files = [music('00000000-0000-4000-8000-000000000010', '2026-10-15T10:00:00Z'), music('00000000-0000-4000-8000-000000000011', '2026-10-16T10:00:00Z')]

    expect(uniqueMusicFiles(files, null).map((file) => file.id)).toEqual(['00000000-0000-4000-8000-000000000011'])
  })

  it('keeps the duplicate referenced by the edited card', () => {
    const selectedId = '00000000-0000-4000-8000-000000000010'
    const files = [music(selectedId, '2026-10-15T10:00:00Z'), music('00000000-0000-4000-8000-000000000011', '2026-10-16T10:00:00Z')]

    expect(uniqueMusicFiles(files, selectedId).map((file) => file.id)).toEqual([selectedId])
  })
})
