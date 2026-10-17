import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ExternalLink, Inbox, RotateCcw, Send, UserRound, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getPublicAudioCard } from '@/entities/audio-card/api/audio-card-api'
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
        return { application, card: await getPublicAudioCard(application.audioCardId) }
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
    <main className="mx-auto w-full max-w-[1290px] px-4 py-6 sm:px-6 lg:py-7">
      <header className="text-center">
        <h1 className="text-[clamp(2.75rem,5vw,4rem)] font-bold leading-none tracking-[-0.035em]">Заявки</h1>
      </header>

      <div className="mx-auto mt-5 flex w-fit rounded-xl border border-border bg-card p-1" role="tablist" aria-label="Тип заявок">
        <button aria-selected={tab === 'incoming'} className={`flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${tab === 'incoming' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('incoming')} role="tab" type="button"><Inbox className="size-4" />Входящие <span className={`rounded-full px-2 py-0.5 text-[10px] ${tab === 'incoming' ? 'bg-white/20' : 'bg-muted'}`}>{incomingCount}</span></button>
        <button aria-selected={tab === 'outgoing'} className={`flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${tab === 'outgoing' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('outgoing')} role="tab" type="button"><Send className="size-4" />Мои отклики</button>
      </div>

      {currentQuery.isLoading ? (
        <div className="mt-6"><AsyncState description="Получаем актуальные заявки." status="loading" title="Загружаем заявки" /></div>
      ) : currentQuery.isError ? (
        <div className="mt-6"><AsyncState description={currentQuery.error instanceof Error ? currentQuery.error.message : 'Повторите запрос.'} onRetry={() => void currentQuery.refetch()} status="error" title="Не удалось загрузить заявки" /></div>
      ) : tab === 'incoming' ? (
        incomingQuery.data?.some((item) => item.candidates.some(({ application }) => application.status !== 'WITHDRAWN')) ? (
          <section className="mt-7 grid gap-10" aria-label="Входящие заявки">
            {incomingQuery.data.map(({ candidates, recruitment }) => {
              const activeCandidates = candidates.filter(({ application }) => application.status !== 'WITHDRAWN')
              if (!activeCandidates.length) return null
              return (
                <article className="rounded-[1.35rem] border border-border bg-card px-5 py-7 sm:px-9" key={recruitment.id}>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <RecruitmentVisual className="h-40 w-[7.7rem] shrink-0" seed={recruitment.id} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[clamp(1.8rem,3vw,2.9rem)] font-bold leading-tight">{recruitment.eventName}</h2>
                      <p className="mt-1 text-[clamp(1rem,2vw,1.9rem)] text-muted-foreground">Кол-во участников: {recruitment.participantsNeeded}</p>
                      <p className="mt-1 text-[clamp(1rem,2vw,1.9rem)] text-muted-foreground">Ищут: {recruitment.title}</p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="whitespace-nowrap text-[clamp(1.6rem,3vw,2.55rem)] text-primary">Количество заявок: {activeCandidates.length}</p>
                      <Button asChild className="mt-4 h-16 rounded-xl px-6 text-[clamp(1.2rem,2vw,2rem)] font-normal"><Link to={`/applications/${recruitment.id}`}>Подробнее</Link></Button>
                    </div>
                  </div>

                  <div className="my-7 h-px bg-border" />
                  <div className="grid gap-4" aria-label={`Список заявок на ${recruitment.eventName}`}>
                    {activeCandidates.map(({ application, card }) => (
                      <section className="flex flex-col gap-4 rounded-[1.2rem] border border-border px-5 py-5 sm:flex-row sm:items-center" key={application.id}>
                        {card?.photoUrl ? <CardImage alt="" className="h-[8.5rem] w-[6.9rem] shrink-0 bg-muted object-cover" src={card.photoUrl} /> : <span className="flex h-[8.5rem] w-[6.9rem] shrink-0 items-center justify-center bg-muted text-muted-foreground"><UserRound className="size-9" /></span>}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-[clamp(1.5rem,2.5vw,2.35rem)] font-normal leading-tight">{card?.fullName || card?.title || 'Кандидат'}</h3>{application.status !== 'PENDING' ? <StatusBadge kind="application" status={application.status} /> : null}</div>
                          <p className="mt-1 text-[clamp(1rem,1.7vw,1.75rem)] text-muted-foreground">Специальность: {card?.description || 'не указана'}</p>
                          <p className="mt-1 text-[clamp(1rem,1.7vw,1.75rem)] text-muted-foreground">Опыт работы: {card?.experienceYears ?? 0} {card?.experienceYears === 1 ? 'год' : card?.experienceYears && card.experienceYears < 5 ? 'года' : 'лет'}</p>
                          {application.message ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{application.message}</p> : null}
                        </div>
                        <div className="grid shrink-0 gap-3 sm:w-[25.5rem] sm:grid-cols-2">
                          {card ? <Button asChild className="col-span-full h-14 text-xl font-normal"><Link target="_blank" to={`/card/${card.id}`}><ExternalLink className="size-5" />Посмотреть визитку</Link></Button> : <Button className="col-span-full h-14" disabled variant="outline">Визитка недоступна</Button>}
                          <Button className="h-11 text-lg font-normal" disabled={application.status !== 'PENDING' || decisionMutation.isPending} onClick={() => decisionMutation.mutate({ id: application.id, status: 'ACCEPTED' })}><Check className="size-5" />Принять</Button>
                          <Button className="h-11 bg-muted text-lg font-normal text-foreground hover:bg-border" disabled={application.status !== 'PENDING' || decisionMutation.isPending} onClick={() => decisionMutation.mutate({ id: application.id, status: 'REJECTED' })}><X className="size-5" />Отказать</Button>
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
            <article className="rounded-[1.5rem] border border-border bg-card p-5" key={application.id}>
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
