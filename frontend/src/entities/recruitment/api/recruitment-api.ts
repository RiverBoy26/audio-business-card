import { z } from 'zod'

import type {
  ApplicationStatus,
  Recruitment,
  RecruitmentDraft,
  RecruitmentRecommendation,
  TeamApplication,
} from '@/entities/recruitment/model/types'
import { apiRequest } from '@/shared/api/api-client'

const recruitmentSchema = z.object({
  id: z.string().uuid(),
  creatorId: z.string().uuid(),
  title: z.string(),
  eventName: z.string(),
  description: z.string(),
  participantsNeeded: z.number().int().positive(),
  acceptedCount: z.number().int().nonnegative(),
  requiredSkills: z.array(z.string()).default([]),
  format: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']),
  location: z.string().nullable(),
  eventUrl: z.string().nullable(),
  deadline: z.string(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const applicationSchema = z.object({
  id: z.string().uuid(),
  recruitmentId: z.string().uuid(),
  applicantId: z.string().uuid(),
  audioCardId: z.string().uuid(),
  message: z.string().nullable(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']),
  viewedAt: z.string().nullable(),
  decidedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const recruitmentPageSchema = z.object({
  content: z.array(recruitmentSchema),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  number: z.number().int().nonnegative(),
  size: z.number().int().positive(),
})

const recommendationSchema = z.object({
  recruitment: recruitmentSchema,
  score: z.number().int().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  matchingCardIds: z.array(z.string().uuid()),
  reasons: z.array(z.string()),
})

const recommendationPageSchema = z.object({
  content: z.array(recommendationSchema),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  number: z.number().int().nonnegative(),
  size: z.number().int().positive(),
})

export function getOpenRecruitments() {
  return apiRequest<{ content: Recruitment[]; totalElements: number }>(
    '/api/v1/recruitments?page=0&size=100',
    { auth: false, schema: recruitmentPageSchema },
  )
}

export function getRecruitment(id: string) {
  return apiRequest<Recruitment>(`/api/v1/recruitments/${id}`, {
    auth: false,
    schema: recruitmentSchema,
  })
}

export function getMyRecruitments() {
  return apiRequest<Recruitment[]>('/api/v1/recruitments/mine', {
    schema: z.array(recruitmentSchema),
  })
}

export function createRecruitment(draft: RecruitmentDraft) {
  return apiRequest<Recruitment>('/api/v1/recruitments', {
    method: 'POST',
    json: draft,
    schema: recruitmentSchema,
  })
}

export function updateRecruitment(id: string, draft: RecruitmentDraft) {
  return apiRequest<Recruitment>(`/api/v1/recruitments/${id}`, {
    method: 'PUT',
    json: draft,
    schema: recruitmentSchema,
  })
}

export function changeRecruitmentStatus(
  id: string,
  action: 'archive' | 'close' | 'publish',
) {
  return apiRequest<Recruitment>(`/api/v1/recruitments/${id}/${action}`, {
    method: 'POST',
    schema: recruitmentSchema,
  })
}

export function applyToRecruitment(
  recruitmentId: string,
  audioCardId: string,
  message: string,
) {
  return apiRequest<TeamApplication>(
    `/api/v1/recruitments/${recruitmentId}/applications`,
    {
      method: 'POST',
      json: { audioCardId, message: message.trim() || null },
      schema: applicationSchema,
    },
  )
}

export function getRecruitmentApplications(recruitmentId: string) {
  return apiRequest<TeamApplication[]>(
    `/api/v1/recruitments/${recruitmentId}/applications`,
    { schema: z.array(applicationSchema) },
  )
}

export function getMyApplications() {
  return apiRequest<TeamApplication[]>('/api/v1/applications/mine', {
    schema: z.array(applicationSchema),
  })
}

export function decideApplication(id: string, status: Extract<ApplicationStatus, 'ACCEPTED' | 'REJECTED'>) {
  return apiRequest<TeamApplication>(`/api/v1/applications/${id}/status`, {
    method: 'PATCH',
    json: { status },
    schema: applicationSchema,
  })
}

export function withdrawApplication(id: string) {
  return apiRequest<TeamApplication>(`/api/v1/applications/${id}/withdraw`, {
    method: 'POST',
    schema: applicationSchema,
  })
}

export function getRecruitmentRecommendations() {
  return apiRequest<{
    content: RecruitmentRecommendation[]
    totalElements: number
  }>('/api/v1/recommendations/recruitments?page=0&size=100', {
    schema: recommendationPageSchema,
  })
}
