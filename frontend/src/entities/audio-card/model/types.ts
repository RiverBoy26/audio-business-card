export type CardStatus = 'published' | 'draft'

export type CardDraft = {
  desiredRole: string
  experience: string
  fullName: string
  skills: string[]
  specialty: string
}

export type AudioCard = CardDraft & {
  duration: string
  id: string
  kind: 'Резюме' | 'Портфолио'
  pdfName?: string
  status: CardStatus
  title: string
  updatedAt: string
}
