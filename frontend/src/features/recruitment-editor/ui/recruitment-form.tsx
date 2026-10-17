import { CalendarDays, Globe2, MapPin, Save, Send } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'

import type {
  EventFormat,
  RecruitmentDraft,
  RecruitmentStatus,
} from '@/entities/recruitment/model/types'
import { toDateTimeLocal } from '@/shared/lib/format-date'
import { Button } from '@/shared/ui/button'
import { Field, SelectField } from '@/shared/ui/field'

type RecruitmentFormProps = {
  error?: string | null
  initialDraft: RecruitmentDraft
  pending: boolean
  status?: RecruitmentStatus
  onSubmit: (draft: RecruitmentDraft, publish: boolean) => void
}

function tomorrowLocal() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export function RecruitmentForm({
  error,
  initialDraft,
  onSubmit,
  pending,
  status,
}: RecruitmentFormProps) {
  const [draft, setDraft] = useState(() => ({
    ...initialDraft,
    deadline: toDateTimeLocal(initialDraft.deadline),
  }))
  const [skills, setSkills] = useState(initialDraft.requiredSkills.join(', '))
  const [intent, setIntent] = useState<'save' | 'publish'>('save')
  const isArchived = status === 'ARCHIVED'
  const canPublish = status === undefined || status === 'DRAFT' || status === 'CLOSED'
  const minimumDeadline = useMemo(() => tomorrowLocal(), [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedSkills = [...new Map(
      skills
        .split(',')
        .map((skill) => skill.trim().replace(/\s+/g, ' '))
        .filter(Boolean)
        .map((skill) => [skill.toLocaleLowerCase('ru'), skill]),
    ).values()].slice(0, 20)

    onSubmit({
      ...draft,
      deadline: new Date(draft.deadline).toISOString(),
      eventUrl: draft.eventUrl?.trim() || null,
      location: draft.format === 'ONLINE' ? null : draft.location?.trim() || null,
      requiredSkills: normalizedSkills,
      title: draft.title.trim(),
      eventName: draft.eventName.trim(),
      description: draft.description.trim(),
    }, intent === 'publish')
  }

  function updateFormat(format: EventFormat) {
    setDraft((current) => ({
      ...current,
      format,
      location: format === 'ONLINE' ? null : current.location,
    }))
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <section className="rounded-[1.6rem] border border-border bg-card p-5 shadow-[0_14px_40px_rgba(13,10,51,0.035)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
            <Globe2 className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">О хакатоне и команде</h2>
            <p className="text-xs text-muted-foreground">Расскажите, кого вы ищете и над чем будете работать.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            disabled={isArchived}
            id="recruitment-event"
            label="Название хакатона"
            maxLength={150}
            onChange={(event) => setDraft({ ...draft, eventName: event.target.value })}
            placeholder="Например, Цифровой прорыв"
            required
            value={draft.eventName}
          />
          <Field
            disabled={isArchived}
            id="recruitment-title"
            label="Название команды или объявления"
            maxLength={150}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="Собираем команду мечты"
            required
            value={draft.title}
          />
        </div>

        <label className="mt-4 grid gap-1.5 text-xs font-medium" htmlFor="recruitment-description">
          Описание задачи и команды
          <textarea
            className="min-h-36 w-full resize-y rounded-xl border border-border bg-card px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-muted"
            disabled={isArchived}
            id="recruitment-description"
            maxLength={5000}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            placeholder="Какая идея, кто уже в команде и чем предстоит заниматься..."
            required
            value={draft.description}
          />
          <span className="text-right font-normal text-muted-foreground">{draft.description.length}/5000</span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px]">
          <Field
            disabled={isArchived}
            id="recruitment-skills"
            label="Кого ищете — навыки через запятую"
            onChange={(event) => setSkills(event.target.value)}
            placeholder="React, UX/UI, Python, ML"
            value={skills}
          />
          <Field
            disabled={isArchived}
            id="recruitment-places"
            label="Свободных мест"
            max={100}
            min={1}
            onChange={(event) => setDraft({ ...draft, participantsNeeded: Number(event.target.value) })}
            required
            type="number"
            value={draft.participantsNeeded}
          />
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-border bg-card p-5 shadow-[0_14px_40px_rgba(13,10,51,0.035)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">Формат и сроки</h2>
            <p className="text-xs text-muted-foreground">Эта информация поможет участникам спланировать работу.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <SelectField
            disabled={isArchived}
            id="recruitment-format"
            label="Формат участия"
            onChange={(event) => updateFormat(event.target.value as EventFormat)}
            value={draft.format}
          >
            <option value="ONLINE">Онлайн</option>
            <option value="OFFLINE">Очно</option>
            <option value="HYBRID">Гибридный</option>
          </SelectField>
          <Field
            disabled={isArchived}
            id="recruitment-deadline"
            label="Принимать заявки до"
            min={minimumDeadline}
            onChange={(event) => setDraft({ ...draft, deadline: event.target.value })}
            required
            type="datetime-local"
            value={draft.deadline}
          />
          {draft.format !== 'ONLINE' ? (
            <Field
              disabled={isArchived}
              id="recruitment-location"
              label="Место проведения"
              maxLength={255}
              onChange={(event) => setDraft({ ...draft, location: event.target.value })}
              placeholder="Город, площадка или адрес"
              required
              value={draft.location ?? ''}
            />
          ) : (
            <div className="flex min-h-16 items-center gap-3 rounded-xl border border-dashed border-border px-4 text-sm text-muted-foreground">
              <MapPin className="size-5 text-primary" />
              Участники смогут подключиться из любой точки.
            </div>
          )}
          <Field
            disabled={isArchived}
            id="recruitment-url"
            label="Ссылка на хакатон"
            maxLength={500}
            onChange={(event) => setDraft({ ...draft, eventUrl: event.target.value })}
            placeholder="https://..."
            type="url"
            value={draft.eventUrl ?? ''}
          />
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!isArchived ? (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            disabled={pending}
            onClick={() => setIntent('save')}
            size="lg"
            type="submit"
            variant="outline"
          >
            <Save className="size-4" />
            {pending && intent === 'save' ? 'Сохраняем…' : status === 'OPEN' ? 'Сохранить изменения' : 'Сохранить черновик'}
          </Button>
          {canPublish ? (
            <Button
              disabled={pending}
              onClick={() => setIntent('publish')}
              size="lg"
              type="submit"
            >
              <Send className="size-4" />
              {pending && intent === 'publish' ? 'Публикуем…' : status === 'CLOSED' ? 'Открыть набор снова' : 'Опубликовать набор'}
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
