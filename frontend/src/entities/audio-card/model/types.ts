export type CardType = 'PORTFOLIO' | 'RESUME'

export type AudioCard = {
  cardType: CardType
  contactEmail: string | null
  contactPhone: string | null
  description: string | null
  documentName: string | null
  documentUrl: string | null
  id: string
  fullName: string | null
  published: boolean
  publishedAt: string | null
  publicCode: string | null
  musicId: string | null
  photoUrl: string | null
  skills: string[]
  title: string
  voiceRecordingId: string | null
}

export type CardDraft = {
  cardType: CardType
  contactEmail: string
  contactPhone: string
  description: string
  documentFile: File | null
  documentName: string | null
  documentUrl: string | null
  experienceYears: number
  fullName: string
  published: boolean
  publicCode: string | null
  musicVolume: number
  musicStartSeconds: number
  musicId: string | null
  photoFile: File | null
  photoUrl: string
  skills: string[]
  title: string
  voiceVolume: number
  voiceRecordingId: string | null
}

export const initialCardDraft: CardDraft = {
  title: '',
  description: '',
  documentFile: null,
  documentName: null,
  documentUrl: null,
  fullName: '',
  contactEmail: '',
  contactPhone: '',
  published: false,
  publicCode: null,
  photoUrl: '',
  photoFile: null,
  cardType: 'RESUME',
  experienceYears: 0,
  skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
  voiceVolume: 100,
  musicVolume: 30,
  musicStartSeconds: 0,
  musicId: null,
  voiceRecordingId: null,
}

export type PublicAudioCard = {
  cardType: CardType
  contactEmail: string | null
  contactPhone: string | null
  description: string | null
  documentName: string | null
  documentUrl: string | null
  experienceYears: number
  fullName: string | null
  id: string
  musicUrl: string | null
  musicVolume: number
  musicStartSeconds: number
  photoUrl: string | null
  publishedAt: string
  publicCode: string
  skills: string[]
  title: string
  voiceUrl: string | null
  voiceVolume: number
}
