import type { AudioCard, CardDraft } from '@/entities/audio-card/model/types'

export const initialCardDraft: CardDraft = {
  fullName: 'Марк Сергеевич Соколов',
  specialty: 'Бэкенд-разработчик',
  experience: '1 год',
  desiredRole: 'Junior Python Developer',
  skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
}

export const audioCards: AudioCard[] = [
  {
    ...initialCardDraft,
    id: 'MK7A2',
    title: 'Для стажировки',
    kind: 'Резюме',
    status: 'published',
    duration: '0:47',
    pdfName: 'Резюме.pdf',
    updatedAt: 'Сегодня, 14:20',
  },
  {
    ...initialCardDraft,
    id: 'PF4B8',
    title: 'Портфолио проектов',
    kind: 'Портфолио',
    specialty: 'Python-разработчик',
    desiredRole: 'Python Developer',
    skills: ['Python', 'Docker', 'SQL'],
    status: 'published',
    duration: '1:12',
    pdfName: 'Портфолио.pdf',
    updatedAt: 'Вчера, 18:45',
  },
  {
    ...initialCardDraft,
    id: 'HC9D3',
    title: 'Для команды хакатона',
    kind: 'Портфолио',
    skills: ['Java', 'Python', 'Docker'],
    status: 'draft',
    duration: '0:28',
    updatedAt: 'Сегодня, 09:10',
  },
]
