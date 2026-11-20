import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  Eye,
  Inbox,
  Pencil,
  Search,
  Send,
  StopCircle,
} from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  changeRecruitmentStatus,
  getMyRecruitments,
} from '@/entities/recruitment/api/recruitment-api'
import type { Recruitment } from '@/entities/recruitment/model/types'
import { StatusBadge } from '@/entities/recruitment/ui/recruitment-status'
import { RecruitmentVisual } from '@/entities/recruitment/ui/recruitment-visual'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

type PendingAction = { action: 'archive' | 'close'; recruitment: Recruitment }

export function MyEventsPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const deferredQuery = useDeferredValue(query)
  const recruitmentsQuery = useQuery({
    queryKey: ['recruitments', 'mine'],
    queryFn: getMyRecruitments,
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'archive' | 'close' | 'publish' }) => changeRecruitmentStatus(id, action),
    onSuccess: async () => {
      setPendingAction(null)
      await queryClient.invalidateQueries({ queryKey: ['recruitments'] })
    },
  })
  const visibleRecruitments = useMemo(() => {
    const normalized = deferredQuery.trim().toLocaleLowerCase('ru')
    return (recruitmentsQuery.data ?? []).filter((item) => `${item.title} ${item.eventName} ${item.requiredSkills.join(' ')}`
      .toLocaleLowerCase('ru')
      .includes(normalized))
  }, [deferredQuery, recruitmentsQuery.data])

  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 py-7 sm:px-6 lg:py-8">
      <header className="text-center">
        <h1 className="text-[clamp(2.75rem,5vw,4rem)] font-bold leading-none tracking-[-0.035em]">Мои мероприятия</h1>
      </header>

      <label className="relative mt-8 block">
        <span className="sr-only">Поиск по мероприятиям</span>
        <Search className="absolute left-10 top-1/2 size-6 -translate-y-1/2 text-foreground" />
        <input className="h-11 w-full rounded-[0.7rem] border border-border bg-card pl-[4.6rem] pr-4 font-[Sansation] text-[1.45rem] outline-none placeholder:text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10" onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию" value={query} />
      </label>

      {recruitmentsQuery.isLoading ? (
        <div className="mt-6"><AsyncState description="Получаем ваши объявления." status="loading" title="Загружаем мероприятия" /></div>
      ) : recruitmentsQuery.isError ? (
        <div className="mt-6"><AsyncState description={recruitmentsQuery.error instanceof Error ? recruitmentsQuery.error.message : 'Повторите запрос.'} onRetry={() => void recruitmentsQuery.refetch()} status="error" title="Не удалось загрузить мероприятия" /></div>
      ) : visibleRecruitments.length ? (
        <section className="mt-7 grid gap-7 lg:grid-cols-2 lg:gap-x-10" aria-label="Мои мероприятия">
          {visibleRecruitments.map((recruitment) => (
            <article className="flex min-h-[21rem] flex-col rounded-[1.35rem] border border-border bg-card p-5" key={recruitment.id}>
              <div className="flex gap-3 sm:gap-4">
                <RecruitmentVisual className="h-[11.6rem] w-[8.7rem] shrink-0 rounded-[1.15rem]" seed={recruitment.id} />
                <div className="min-w-0 flex-1 py-1">
                  <div className="flex items-start justify-between gap-2"><StatusBadge status={recruitment.status} /></div>
                  <h2 className="mt-3 line-clamp-2 text-[1.7rem] font-bold leading-tight">{recruitment.eventName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Кол-во участников: {recruitment.participantsNeeded}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">Ищем: {recruitment.title}</p>
                  <Button asChild className="mt-12" size="sm"><Link to={`/events/${recruitment.id}`}>Открыть</Link></Button>
                </div>
              </div>

              <p className="mt-auto pt-6 text-xs">Код мероприятия: {recruitment.id.slice(0, 6).toUpperCase()}</p>
              <div className="mt-1 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
                <Button asChild size="sm" variant="outline"><Link to={`/events/${recruitment.id}/edit`}><Pencil className="size-3.5" />Изменить</Link></Button>
                <Button asChild size="sm" variant="outline"><Link to={`/applications/${recruitment.id}`}><Inbox className="size-3.5" />Заявки</Link></Button>
                {recruitment.status === 'OPEN' ? (
                  <>
                    <Button asChild size="sm" variant="outline"><Link to={`/events/${recruitment.id}`}><Eye className="size-3.5" />Открыть</Link></Button>
                    <Button disabled={statusMutation.isPending} onClick={() => setPendingAction({ action: 'close', recruitment })} size="sm" variant="outline"><StopCircle className="size-3.5" />Закрыть</Button>
                  </>
                ) : recruitment.status === 'DRAFT' || recruitment.status === 'CLOSED' ? (
                  <>
                    <Button disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: recruitment.id, action: 'publish' })} size="sm"><Send className="size-3.5" />Опубликовать</Button>
                    <Button disabled={statusMutation.isPending} onClick={() => setPendingAction({ action: 'archive', recruitment })} size="sm" variant="outline"><Archive className="size-3.5" />В архив</Button>
                  </>
                ) : (
                  <div className="col-span-2 flex items-center justify-center text-xs text-muted-foreground">Архивное объявление</div>
                )}
              </div>
              {statusMutation.isError && statusMutation.variables?.id === recruitment.id ? <p className="mt-3 text-xs text-destructive">{statusMutation.error instanceof Error ? statusMutation.error.message : 'Не удалось изменить статус.'}</p> : null}
            </article>
          ))}
        </section>
      ) : (
        <div className="mt-6"><AsyncState description={query ? 'Измените поисковый запрос.' : 'Создайте первый набор в команду.'} onRetry={query ? () => setQuery('') : undefined} status="empty" title="Мероприятия не найдены" /></div>
      )}

      <Modal className="max-w-md" onClose={() => !statusMutation.isPending && setPendingAction(null)} open={pendingAction !== null} title="Подтвердить действие">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">{pendingAction?.action === 'archive' ? <Archive className="size-6" /> : <StopCircle className="size-6" />}</span>
        <h2 className="mt-5 pr-8 text-xl font-bold">{pendingAction?.action === 'archive' ? 'Перенести объявление в архив?' : 'Закрыть набор?'}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{pendingAction?.action === 'archive' ? 'Архивное объявление нельзя будет изменить или опубликовать снова.' : 'Новые участники больше не смогут отправлять заявки. Набор можно будет открыть снова.'}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button disabled={statusMutation.isPending} onClick={() => setPendingAction(null)} variant="outline">Отмена</Button>
          <Button disabled={!pendingAction || statusMutation.isPending} onClick={() => pendingAction && statusMutation.mutate({ id: pendingAction.recruitment.id, action: pendingAction.action })}>{statusMutation.isPending ? 'Сохраняем…' : 'Подтвердить'}</Button>
        </div>
      </Modal>
    </main>
  )
}
