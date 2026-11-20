import type { MusicFile } from '@/entities/music/api/music-api'

function musicKey(file: MusicFile) {
  return `${file.system ? 'system' : file.userId}|${file.originalFilename.trim().toLocaleLowerCase('ru')}|${file.size}`
}

export function uniqueMusicFiles(files: MusicFile[], selectedId: string | null) {
  const unique = new Map<string, MusicFile>()

  for (const file of files) {
    const key = musicKey(file)
    const existing = unique.get(key)
    if (!existing || file.id === selectedId || (existing.id !== selectedId && file.uploadedAt > existing.uploadedAt)) {
      unique.set(key, file)
    }
  }

  return [...unique.values()]
}
