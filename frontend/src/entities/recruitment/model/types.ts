export type EventFormat = 'ONLINE' | 'OFFLINE' | 'HYBRID'

export type RecruitmentStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED'

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export type Recruitment = {
  acceptedCount: number
  createdAt: string
  creatorId: string
  deadline: string
  description: string
  eventName: string
  eventUrl: string | null
  format: EventFormat
  id: string
  location: string | null
  participantsNeeded: number
  requiredSkills: string[]
  status: RecruitmentStatus
  title: string
  updatedAt: string
}

export type RecruitmentDraft = Pick<
  Recruitment,
  | 'deadline'
  | 'description'
  | 'eventName'
  | 'eventUrl'
  | 'format'
  | 'location'
  | 'participantsNeeded'
  | 'requiredSkills'
  | 'title'
>

export type TeamApplication = {
  applicantId: string
  audioCardId: string
  createdAt: string
  decidedAt: string | null
  id: string
  message: string | null
  recruitmentId: string
  status: ApplicationStatus
  updatedAt: string
  viewedAt: string | null
}

export type RecruitmentRecommendation = {
  matchedSkills: string[]
  matchingCardIds: string[]
  missingSkills: string[]
  reasons: string[]
  recruitment: Recruitment
  score: number
}

export const initialRecruitmentDraft: RecruitmentDraft = {
  title: '',
  eventName: '',
  description: '',
  participantsNeeded: 1,
  requiredSkills: [],
  format: 'ONLINE',
  location: null,
  eventUrl: null,
  deadline: '',
}
