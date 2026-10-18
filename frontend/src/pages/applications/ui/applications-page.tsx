import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ExternalLink, Inbox, RotateCcw, Send, UserRound, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getApplicationAudioCard } from '@/entities/audio-card/api/audio-card-api'
import type { PublicAudioCard } from '@/entities/audio-card/model/types'
import { CardImage } from '@/entities/audio-card/ui/card-image'
import {
  decideApplication,
  getMyApplications,
  getMyRecruitments,
  getOpenRecruitments,
  getRecruitmentApplications,
  withdrawApplication,
} from '@/entities/recruitment/api/recruitment-api'
import type { TeamApplication } from '@/entities/recruitment/model/types'
import { StatusBadge } from '@/entities/recruitment/ui/recruitment-status'
import { RecruitmentVisual } from '@/entities/recruitment/ui/recruitment-visual'
import { formatDateTime } from '@/shared/lib/format-date'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'

type ApplicationsTab = 'incoming' | 'outgoing'
type IncomingCandidate = { application: TeamApplication; card: PublicAudioCard | null }

async function getIncomingApplications() {
  const recruitments = await getMyRecruitments()
  return Promise.all(recruitments.map(async (recruitment) => {
    const applications = await getRecruitmentApplications(recruitment.id)
    const candidates: IncomingCandidate[] = await Promise.all(applications.map(async (application) => {
      try {
        return { application, card: await getApplicationAudioCard(application.id) }
      } catch {
        return { application, card: null }
      }
    }))
    return { recruitment, candidates }
  }))
}

async function getOutgoingApplications() {
  const [applications, recruitments] = await Promise.all([
    getMyApplications(),
    getOpenRecruitments(),
  ])
  const recruitmentById = new Map(recruitments.content.map((item) => [item.id, item]))
  return applications.map((application) => ({
    application,
    recruitment: recruitmentById.get(application.recruitmentId) ?? null,
  }))
}

export function ApplicationsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<ApplicationsTab>('incoming')
  const incomingQuery = useQuery({
    queryKey: ['applications', 'incoming'],
    queryFn: getIncomingApplications,
  })
  const outgoingQuery = useQuery({
    queryKey: ['my-applications'],
    queryFn: getOutgoingApplications,
  })
  const withdrawMutation = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
        queryClient.invalidateQueries({ queryKey: ['recruitment-recommendations'] }),
      ])
    },
  })
  const decisionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) => decideApplication(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['applications', 'incoming'] }),
        queryClient.invalidateQueries({ queryKey: ['recruitments', 'mine'] }),
      ])
    },
  })
  const incomingCount = useMemo(() => (incomingQuery.data ?? []).reduce(
    (count, item) => count + item.candidates.filter(({ application }) => application.status !== 'WITHDRAWN').length,
    0,
  ), [incomingQuery.data])
  const currentQuery = tab === 'incoming' ? incomingQuery : outgoingQuery

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-9 sm:px-6 lg:py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Заявки</h1>
      </header>

      <div className="mt-5 flex w-fit max-w-full rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Тип заявок">
        <button aria-selected={tab === 'incoming'} className={`flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${tab === 'incoming' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('incoming')} role="tab" type="button"><Inbox className="size-4" />Входящие <span className={`rounded-full px-2 py-0.5 text-[10px] ${tab === 'incoming' ? 'bg-white/20' : 'bg-muted'}`}>{incomingCount}</span></button>
        <button aria-selected={tab === 'outgoing'} className={`flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${tab === 'outgoing' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('outgoing')} role="tab" type="button"><Send className="size-4" />Мои отклики</button>
      </div>

      {currentQuery.isLoading ? (
        <div className="mt-6"><AsyncState description="Получаем актуальные заявки." status="loading" title="Загружаем заявки" /></div>
      ) : currentQuery.isError ? (
        <div className="mt-6"><AsyncState description={currentQuery.error instanceof Error ? currentQuery.error.message : 'Повторите запрос.'} onRetry={() => void currentQuery.refetch()} status="error" title="Не удалось загрузить заявки" /></div>
      ) : tab === 'incoming' ? (
        incomingQuery.data?.some((item) => item.candidates.some(({ application }) => application.status !== 'WITHDRAWN')) ? (
          <section className="mt-7 grid gap-5" aria-label="Входящие заявки">
            {incomingQuery.data.map(({ candidates, recruitment }) => {
              const activeCandidates = candidates.filter(({ application }) => application.status !== 'WITHDRAWN')
              if (!activeCandidates.length) return null
              return (
                <article className="rounded-lg border border-border bg-card p-5 sm:p-6" key={recruitment.id}>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <RecruitmentVisual className="size-16 sm:size-20" label={recruitment.eventName} />
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-xl font-semibold leading-tight">{recruitment.eventName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Участников нужно: {recruitment.participantsNeeded}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Ищут: {recruitment.title}</p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-sm font-medium">Заявок: {activeCandidates.length}</p>
                      <Button asChild className="mt-3"><Link to={`/applications/${recruitment.id}`}>Все заявки</Link></Button>
                    </div>
                  </div>

                  <div className="my-5 h-px bg-border" />
                  <div className="grid gap-4" aria-label={`Список заявок на ${recruitment.eventName}`}>
                    {activeCandidates.map(({ application, card }) => (
                      <section className="flex flex-col gap-4 rounded-md border border-border p-4 sm:flex-row sm:items-center" key={application.id}>
                        {card?.photoUrl ? <CardImage alt="" className="size-16 shrink-0 rounded-md bg-muted object-cover" src={card.photoUrl} /> : <span className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><UserRound className="size-6" /></span>}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-base font-semibold leading-tight">{card?.fullName || card?.title || 'Кандидат'}</h3>{application.status !== 'PENDING' ? <StatusBadge kind="application" status={application.status} /> : null}</div>
                          <p className="mt-1 text-sm text-muted-foreground">Специальность: {card?.description || 'не указана'}</p>
                          <p className="mt-1 text-sm text-muted-foreground">Опыт работы: {card?.experienceYears ?? 0} {card?.experienceYears === 1 ? 'год' : card?.experienceYears && card.experienceYears < 5 ? 'года' : 'лет'}</p>
                          {application.message ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{application.message}</p> : null}
                        </div>
                        <div className="grid shrink-0 gap-2 sm:w-56 sm:grid-cols-2">
                          {card ? <Button asChild className="col-span-full" variant="outline"><Link target="_blank" to={`/applications/${application.id}/card`}><ExternalLink className="size-4" />Визитка</Link></Button> : <Button className="col-span-full" disabled variant="outline">Визитка недоступна</Button>}
                          <Button disabled={application.status !== 'PENDING' || decisionMutation.isPending} onClick={() => decisionMutation.mutate({ id: application.id, status: 'ACCEPTED' })}><Check className="size-4" />Принять</Button>
                          <Button disabled={application.status !== 'PENDING' || decisionMutation.isPending} onClick={() => decisionMutation.mutate({ id: application.id, status: 'REJECTED' })} variant="outline"><X className="size-4" />Отказать</Button>
                        </div>
                      </section>
                    ))}
                  </div>
                  {decisionMutation.isError ? <p className="mt-4 text-sm text-destructive">{decisionMutation.error instanceof Error ? decisionMutation.error.message : 'Не удалось сохранить решение.'}</p> : null}
                </article>
              )
            })}
          </section>
        ) : <div className="mt-6"><AsyncState description="Когда кто-то отправит визитку в вашу команду, она появится здесь." status="empty" title="Входящих заявок пока нет" /></div>
      ) : outgoingQuery.data?.length ? (
        <section className="mt-6 grid gap-4" aria-label="Мои отклики">
          {outgoingQuery.data.map(({ application, recruitment }) => (
            <article className="rounded-lg border border-border bg-card p-5" key={application.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">{recruitment?.eventName ?? 'Хакатон'}</p>
                  <h2 className="mt-2 line-clamp-2 text-xl font-bold">{recruitment?.title ?? `Набор ${application.recruitmentId.slice(0, 8)}`}</h2>
                </div>
                <StatusBadge kind="application" status={application.status} />
              </div>
              {application.message ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{application.message}</p> : null}
              <p className="mt-4 text-xs text-muted-foreground">Отправлено {formatDateTime(application.createdAt)}</p>
              <div className="mt-5 flex gap-2 border-t border-border pt-4">
                {recruitment ? <Button asChild className="flex-1" variant="outline"><Link to={`/events/${recruitment.id}`}>Открыть набор</Link></Button> : null}
                {application.status === 'PENDING' || application.status === 'ACCEPTED' ? (
                  <Button className="flex-1" disabled={withdrawMutation.isPending} onClick={() => withdrawMutation.mutate(application.id)} variant="outline"><RotateCcw className="size-4" />Отозвать</Button>
                ) : null}
              </div>
              {withdrawMutation.isError && withdrawMutation.variables === application.id ? <p className="mt-3 text-xs text-destructive">{withdrawMutation.error instanceof Error ? withdrawMutation.error.message : 'Не удалось отозвать заявку.'}</p> : null}
            </article>
          ))}
        </section>
      ) : <div className="mt-6"><AsyncState description="Выберите интересный набор и отправьте опубликованную визитку." status="empty" title="Вы ещё не откликались" /></div>}
    </main>
  )
}
