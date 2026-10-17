import type { VoiceProfile } from '@/entities/voice-profile/api/voice-profile-api'

const hiddenIssues = new Set([
  'TEMPLATE_MARKERS_MISSING',
  'TRAILING_HALLUCINATION_REMOVED',
  'TRAILING_NON_SPEECH_REMOVED',
  'UNKNOWN_SKILLS',
])

const issueMessages: Record<string, string> = {
  DESIRED_POSITION_MISSING: 'Не удалось определить желаемую должность.',
  EXPERIENCE_MISSING_OR_INVALID: 'Не указан опыт. Назовите срок или скажите «без опыта».',
  NEGATION_REQUIRES_REVIEW: 'Проверьте технологии: в записи использовано отрицание.',
  SKILLS_MISSING_OR_UNKNOWN: 'Не удалось определить технологии.',
  SPECIALIZATION_AMBIGUOUS: 'Специальность распознана неоднозначно.',
  SPECIALIZATION_MISSING_OR_UNKNOWN: 'Не удалось определить специальность.',
}

export function getVoiceProfileFeedback(profile: VoiceProfile) {
  const messages: string[] = []

  if (profile.unknownSkills.length) {
    messages.push(`Не распознано: ${profile.unknownSkills.map((skill) => `«${skill}»`).join(', ')}. Проверьте название технологии.`)
  }

  for (const issue of profile.issues) {
    if (hiddenIssues.has(issue) || issue.startsWith('SKILL_SUGGESTION:')) continue
    if (issue.startsWith('REPEATED_SECTION:')) {
      messages.push('Некоторые данные повторяются — проверьте заполненные поля.')
      continue
    }
    const message = issueMessages[issue]
    if (message) messages.push(message)
  }

  return [...new Set(messages)]
}
