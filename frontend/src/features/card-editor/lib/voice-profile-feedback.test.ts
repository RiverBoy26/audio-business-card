import { describe, expect, it } from 'vitest'

import type { VoiceProfile } from '@/entities/voice-profile/api/voice-profile-api'

import { getVoiceProfileFeedback } from './voice-profile-feedback'

const baseProfile: VoiceProfile = {
  desiredPosition: 'Middle Java-разработчик',
  experience: null,
  issues: [],
  requiresConfirmation: true,
  skills: ['Java'],
  specialization: 'Бэкенд-разработчик',
  sphere: 'Веб-разработка',
  transcript: 'Тестовая запись',
  unknownSkills: [],
}

describe('getVoiceProfileFeedback', () => {
  it('turns validation codes into concise guidance', () => {
    expect(getVoiceProfileFeedback({
      ...baseProfile,
      issues: ['UNKNOWN_SKILLS', 'EXPERIENCE_MISSING_OR_INVALID'],
      unknownSkills: ['фастерин'],
    })).toEqual([
      'Не распознано: «фастерин». Проверьте название технологии.',
      'Не указан опыт. Назовите срок или скажите «без опыта».',
    ])
  })

  it('does not expose internal informational codes', () => {
    expect(getVoiceProfileFeedback({
      ...baseProfile,
      issues: ['TRAILING_NON_SPEECH_REMOVED', 'TEMPLATE_MARKERS_MISSING'],
    })).toEqual([])
  })
})
