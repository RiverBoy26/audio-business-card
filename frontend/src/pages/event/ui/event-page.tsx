import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Send,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getMyApplications,
  getRecruitment,
} from '@/entities/recruitment/api/recruitment-api'
import { RecruitmentVisual } from '@/entities/recruitment/ui/recruitment-visual'
import { useAuth } from '@/features/auth/model/use-auth'
import { ApplyDialog } from '@/features/application/ui/apply-dialog'
import { formatDateTime } from '@/shared/lib/format-date'
import { pluralizeRu } from '@/shared/lib/pluralize-ru'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'
import { Tag } from '@/shared/ui/tag'

const formatLabels = {
  ONLINE: 'Онлайн',
  OFFLINE: 'Очно',
  HYBRID: 'Гибридный формат',
} as const

export function EventPage() {
  const { recruitmentId = '' } = useParams()
  const { user } = useAuth()
  const [applyOpen, setApplyOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const recruitmentQuery = useQuery({
    queryKey: ['recruitment', recruitmentId],
    queryFn: () => getRecruitment(recruitmentId),
    enabled: Boolean(recruitmentId),
  })
  const applicationsQuery = useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplications,
    enabled: Boolean(user),
  })

  if (recruitmentQuery.isLoading) {
    return <main className="mx-auto max-w-5xl px-4 py-12"><AsyncState description="Получаем детали набора." status="loading" title="Загружаем мероприятие" /></main>
  }
  if (recruitmentQuery.isError || !recruitmentQuery.data) {
    return <main className="mx-auto max-w-5xl px-4 py-12"><AsyncState description={recruitmentQuery.error instanceof Error ? recruitmentQuery.error.message : 'Набор закрыт или не найден.'} onRetry={() => void recruitmentQuery.refetch()} status="error" title="Не удалось открыть мероприятие" /></main>
  }

  const recruitment = recruitmentQuery.data
  const isOwner = user?.id === recruitment.creatorId
  const existingApplication = applicationsQuery.data?.find((item) => item.recruitmentId === recruitment.id && item.status !== 'WITHDRAWN')
  const placesLeft = Math.max(0, recruitment.participantsNeeded - recruitment.acceptedCount)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Button asChild className="-ml-3" variant="ghost"><Link to="/events"><ArrowLeft className="size-4" />Все мероприятия</Link></Button>

      <article className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[96px_1fr]">
          <RecruitmentVisual className="size-24" label={recruitment.eventName} />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{recruitment.eventName}</p>
            <h1 className="mt-2 break-words text-2xl font-semibold leading-tight sm:text-3xl">{recruitment.title}</h1>

            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-muted/55 p-3.5">
                <UsersRound className="size-5 text-primary" />
                <span><strong>{placesLeft}</strong> {pluralizeRu(placesLeft, 'место', 'места', 'мест')} осталось</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-muted/55 p-3.5">
                <CalendarDays className="size-5 text-primary" />
                <span>Заявки до <strong>{formatDateTime(recruitment.deadline)}</strong></span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-muted/55 p-3.5 sm:col-span-2">
                <MapPin className="size-5 text-primary" />
                <span>{recruitment.location || formatLabels[recruitment.format]}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {recruitment.requiredSkills.map((skill) => <Tag key={skill}>{skill}</Tag>)}
            </div>
          </div>
        </div>

        <div className="grid border-t border-border lg:grid-cols-[1fr_330px]">
          <section className="p-5 sm:p-8 lg:p-10" aria-labelledby="about-team">
            <h2 className="text-2xl font-bold" id="about-team">О проекте и команде</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base">{recruitment.description}</p>
            {recruitment.eventUrl ? (
              <a className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline" href={recruitment.eventUrl} rel="noreferrer" target="_blank">
                Страница хакатона <ExternalLink className="size-4" />
              </a>
            ) : null}
          </section>

          <aside className="border-t border-border bg-accent/35 p-5 sm:p-7 lg:border-l lg:border-t-0">
            <h2 className="text-xl font-bold">Готовы присоединиться?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Отправьте визитку с голосовым рассказом — так команда быстрее познакомится с вами.</p>

            {sent || existingApplication ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="mb-2 size-5" />
                Заявка отправлена и ожидает решения автора.
              </div>
            ) : isOwner ? (
              <Button asChild className="mt-5 w-full" size="lg"><Link to={`/applications/${recruitment.id}`}>Посмотреть заявки</Link></Button>
            ) : user ? (
              <Button className="mt-5 w-full" disabled={placesLeft === 0} onClick={() => setApplyOpen(true)} size="lg">
                <Send className="size-5" />{placesLeft === 0 ? 'Все места заняты' : 'Отправить визитку'}
              </Button>
            ) : (
              <Button asChild className="mt-5 w-full" size="lg"><Link to={`?login=1`}><Send className="size-5" />Войти и откликнуться</Link></Button>
            )}
          </aside>
        </div>
      </article>

      <ApplyDialog
        onClose={() => setApplyOpen(false)}
        onSuccess={() => { setApplyOpen(false); setSent(true) }}
        open={applyOpen}
        recruitmentId={recruitment.id}
        recruitmentTitle={recruitment.title}
      />
    </main>
  )
}
