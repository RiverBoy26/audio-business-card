import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, ExternalLink, MessageSquareText, UserRound, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { getApplicationAudioCard } from '@/entities/audio-card/api/audio-card-api'
import type { PublicAudioCard } from '@/entities/audio-card/model/types'
import { CardImage } from '@/entities/audio-card/ui/card-image'
import {
  decideApplication,
  getMyRecruitments,
  getRecruitmentApplications,
} from '@/entities/recruitment/api/recruitment-api'
import type { TeamApplication } from '@/entities/recruitment/model/types'
import { StatusBadge } from '@/entities/recruitment/ui/recruitment-status'
import { formatDateTime } from '@/shared/lib/format-date'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'

type Candidate = {
  application: TeamApplication
  card: PublicAudioCard | null
}

async function getApplicationsWithCards(recruitmentId: string) {
  const [recruitments, applications] = await Promise.all([
    getMyRecruitments(),
    getRecruitmentApplications(recruitmentId),
  ])
  const recruitment = recruitments.find((item) => item.id === recruitmentId)
  if (!recruitment) throw new Error('Объявление не найдено среди ваших наборов.')
  const candidates: Candidate[] = await Promise.all(applications.map(async (application) => {
    try {
      return { application, card: await getApplicationAudioCard(application.id) }
    } catch {
      return { application, card: null }
    }
  }))
  return { recruitment, candidates }
}

export function RecruitmentApplicationsPage() {
  const { recruitmentId = '' } = useParams()
  const queryClient = useQueryClient()
  const applicationsQuery = useQuery({
    queryKey: ['applications', recruitmentId],
    queryFn: () => getApplicationsWithCards(recruitmentId),
    enabled: Boolean(recruitmentId),
  })
  const decisionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) => decideApplication(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['applications', recruitmentId] }),
        queryClient.invalidateQueries({ queryKey: ['applications', 'incoming'] }),
        queryClient.invalidateQueries({ queryKey: ['recruitments', 'mine'] }),
      ])
    },
  })

  if (applicationsQuery.isLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-12"><AsyncState description="Получаем визитки кандидатов." status="loading" title="Загружаем заявки" /></main>
  }
  if (applicationsQuery.isError || !applicationsQuery.data) {
    return <main className="mx-auto max-w-6xl px-4 py-12"><AsyncState description={applicationsQuery.error instanceof Error ? applicationsQuery.error.message : 'Повторите запрос.'} onRetry={() => void applicationsQuery.refetch()} status="error" title="Не удалось загрузить заявки" /></main>
  }

  const { candidates, recruitment } = applicationsQuery.data
  const activeCandidates = candidates.filter(({ application }) => application.status !== 'WITHDRAWN')

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Button asChild className="-ml-3" variant="ghost"><Link to="/applications"><ArrowLeft className="size-4" />Все заявки</Link></Button>
      <header className="mt-5 rounded-[1.7rem] border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-primary">{recruitment.eventName}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.025em] sm:text-4xl">{recruitment.title}</h1>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold text-primary">{activeCandidates.length}</p>
            <p className="text-xs text-muted-foreground">кандидатов · принято {recruitment.acceptedCount} из {recruitment.participantsNeeded}</p>
          </div>
        </div>
      </header>

      {activeCandidates.length ? (
        <section className="mt-5 grid gap-4" aria-label="Кандидаты">
          {activeCandidates.map(({ application, card }) => (
            <article className="rounded-[1.6rem] border border-border bg-card p-5 shadow-[0_12px_38px_rgba(13,10,51,0.035)] sm:p-6" key={application.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 gap-4">
                  {card?.photoUrl ? (
                    <CardImage alt="" className="size-20 shrink-0 rounded-2xl bg-muted object-cover" src={card.photoUrl} />
                  ) : (
                    <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><UserRound className="size-8" /></span>
                  )}
                  <div className="min-w-0 py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-xl font-bold">{card?.fullName || card?.title || 'Кандидат'}</h2>
                      <StatusBadge kind="application" status={application.status} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-primary">{card?.title || 'Визитка недоступна'}</p>
                    {card ? <p className="mt-2 text-xs text-muted-foreground">Опыт: {card.experienceYears} · {card.skills.slice(0, 4).join(' · ') || 'навыки не указаны'}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">Заявка от {formatDateTime(application.createdAt)}</p>
                  </div>
                </div>

                <div className="grid shrink-0 gap-2 sm:grid-cols-3 lg:w-[520px]">
                  {card ? (
                    <Button asChild variant="outline"><Link target="_blank" to={`/applications/${application.id}/card`}><ExternalLink className="size-4" />Прослушать визитку</Link></Button>
                  ) : <Button disabled variant="outline">Визитка недоступна</Button>}
                  <Button disabled={application.status !== 'PENDING' || decisionMutation.isPending} onClick={() => decisionMutation.mutate({ id: application.id, status: 'ACCEPTED' })}><Check className="size-4" />Принять</Button>
                  <Button disabled={application.status !== 'PENDING' || decisionMutation.isPending} onClick={() => decisionMutation.mutate({ id: application.id, status: 'REJECTED' })} variant="outline"><X className="size-4" />Отклонить</Button>
                </div>
              </div>

              {application.message ? (
                <div className="mt-5 flex gap-3 rounded-xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
                  <MessageSquareText className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>{application.message}</p>
                </div>
              ) : null}
              {decisionMutation.isError && decisionMutation.variables?.id === application.id ? <p className="mt-3 text-xs text-destructive">{decisionMutation.error instanceof Error ? decisionMutation.error.message : 'Не удалось сохранить решение.'}</p> : null}
            </article>
          ))}
        </section>
      ) : <div className="mt-5"><AsyncState description="Поделитесь объявлением — новые заявки появятся на этой странице." status="empty" title="Кандидатов пока нет" /></div>}
    </main>
  )
}
