import { useQuery } from '@tanstack/react-query'
import { ListFilter, Plus, Search, Sparkles } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getOpenRecruitments,
  getRecruitmentRecommendations,
} from '@/entities/recruitment/api/recruitment-api'
import type { EventFormat } from '@/entities/recruitment/model/types'
import { RecruitmentCard } from '@/entities/recruitment/ui/recruitment-card'
import { useAuth } from '@/features/auth/model/use-auth'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'

type FormatFilter = EventFormat | 'ALL'
type RecommendationFilter = 'ALL' | 'RECOMMENDED'

export function EventsPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [format, setFormat] = useState<FormatFilter>('ALL')
  const [recommendation, setRecommendation] = useState<RecommendationFilter>('ALL')
  const [stack, setStack] = useState('ALL')
  const deferredQuery = useDeferredValue(query)
  const recruitmentsQuery = useQuery({
    queryKey: ['recruitments', 'open'],
    queryFn: getOpenRecruitments,
  })
  const recommendationsQuery = useQuery({
    queryKey: ['recruitment-recommendations'],
    queryFn: getRecruitmentRecommendations,
    enabled: Boolean(user),
  })
  const scores = useMemo(
    () => new Map((recommendationsQuery.data?.content ?? []).map((item) => [item.recruitment.id, item.score])),
    [recommendationsQuery.data],
  )
  const recommendedIds = useMemo(
    () => new Set(
      (recommendationsQuery.data?.content ?? [])
        .filter((item) => item.matchingCardIds.length > 0)
        .map((item) => item.recruitment.id),
    ),
    [recommendationsQuery.data],
  )
  const stackOptions = useMemo(() => {
    const unique = new Map<string, string>()
    for (const recruitment of recruitmentsQuery.data?.content ?? []) {
      for (const skill of recruitment.requiredSkills) {
        unique.set(skill.trim().toLocaleLowerCase('ru'), skill.trim())
      }
    }
    return [...unique.entries()].sort((left, right) => left[1].localeCompare(right[1], 'ru'))
  }, [recruitmentsQuery.data])
  const visibleRecruitments = useMemo(() => {
    const normalized = deferredQuery.trim().toLocaleLowerCase('ru')
    return (recruitmentsQuery.data?.content ?? [])
      .filter((item) => format === 'ALL' || item.format === format)
      .filter((item) => recommendation === 'ALL' || !user || recommendedIds.has(item.id))
      .filter((item) => stack === 'ALL' || item.requiredSkills.some((skill) => skill.trim().toLocaleLowerCase('ru') === stack))
      .filter((item) => `${item.title} ${item.eventName} ${item.description} ${item.requiredSkills.join(' ')}`
        .toLocaleLowerCase('ru')
        .includes(normalized))
      .sort((left, right) => (scores.get(right.id) ?? 0) - (scores.get(left.id) ?? 0))
  }, [deferredQuery, format, recommendation, recommendedIds, recruitmentsQuery.data, scores, stack, user])

  const hasActiveFilters = Boolean(query) || format !== 'ALL' || recommendation !== 'ALL' || stack !== 'ALL'

  function resetFilters() {
    setQuery('')
    setFormat('ALL')
    setRecommendation('ALL')
    setStack('ALL')
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="size-3.5" />
            Найдите свою команду
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl lg:text-6xl">Мероприятия</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Открытые наборы в команды на хакатоны. Выберите проект и отправьте свою аудиовизитку.
          </p>
        </div>
        {user ? (
          <Button asChild size="lg">
            <Link to="/events/new"><Plus className="size-5" />Создать набор</Link>
          </Button>
        ) : null}
      </header>

      <section aria-label="Поиск и фильтры" className="mt-8 grid gap-3 rounded-[1.35rem] border border-border/80 bg-card p-3 shadow-[0_12px_35px_rgba(13,10,51,0.035)] md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_210px_190px_auto]">
        <label className="relative block">
          <span className="sr-only">Поиск мероприятий</span>
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-primary" />
          <input
            className="h-12 w-full rounded-xl border border-transparent bg-muted/55 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/35 focus:bg-card focus:ring-2 focus:ring-primary/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Название, роль или технология"
            value={query}
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Фильтр по рекомендациям</span>
          <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
          <select
            className="h-12 w-full rounded-xl border border-transparent bg-muted/55 pl-10 pr-8 text-sm font-medium outline-none transition focus:border-primary/35 focus:bg-card focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:text-muted-foreground"
            disabled={!user}
            onChange={(event) => setRecommendation(event.target.value as RecommendationFilter)}
            title={user ? undefined : 'Войдите, чтобы использовать персональные рекомендации'}
            value={recommendation}
          >
            <option value="ALL">Все мероприятия</option>
            <option value="RECOMMENDED">Рекомендованные мне</option>
          </select>
        </label>
        <label className="relative block">
          <span className="sr-only">Фильтр по стеку</span>
          <select
            className="h-12 w-full rounded-xl border border-transparent bg-muted/55 px-3 text-sm font-medium outline-none transition focus:border-primary/35 focus:bg-card focus:ring-2 focus:ring-primary/10"
            onChange={(event) => setStack(event.target.value)}
            value={stack}
          >
            <option value="ALL">Любой стек</option>
            {stackOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-2 overflow-x-auto" role="group" aria-label="Формат мероприятия">
          <ListFilter className="ml-1 hidden size-4 shrink-0 text-muted-foreground sm:block" />
          {([
            ['ALL', 'Все'],
            ['ONLINE', 'Онлайн'],
            ['OFFLINE', 'Очно'],
            ['HYBRID', 'Гибрид'],
          ] as const).map(([value, label]) => (
            <button
              aria-pressed={format === value}
              className={`h-10 shrink-0 rounded-lg px-3.5 text-xs font-bold transition ${format === value ? 'bg-primary text-white' : 'bg-muted/55 text-muted-foreground hover:text-foreground'}`}
              key={value}
              onClick={() => setFormat(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {user && recommendationsQuery.data?.content.length ? (
        <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-4 text-primary" />
          Сначала показываем команды, которые лучше совпадают с навыками в ваших визитках.
        </p>
      ) : null}

      {recruitmentsQuery.isLoading ? (
        <div className="mt-6"><AsyncState description="Получаем открытые наборы." status="loading" title="Загружаем мероприятия" /></div>
      ) : recruitmentsQuery.isError ? (
        <div className="mt-6"><AsyncState description={recruitmentsQuery.error instanceof Error ? recruitmentsQuery.error.message : 'Повторите запрос.'} onRetry={() => void recruitmentsQuery.refetch()} status="error" title="Не удалось загрузить мероприятия" /></div>
      ) : visibleRecruitments.length ? (
        <section aria-label="Список мероприятий" className="mt-6 grid gap-5 md:grid-cols-2">
          {visibleRecruitments.map((recruitment) => (
            <RecruitmentCard key={recruitment.id} recruitment={recruitment} score={scores.get(recruitment.id)} />
          ))}
        </section>
      ) : (
        <div className="mt-6">
          <AsyncState description={hasActiveFilters ? 'Попробуйте изменить поисковый запрос или фильтры.' : 'Пока нет опубликованных наборов.'} onRetry={hasActiveFilters ? resetFilters : undefined} status="empty" title="Ничего не найдено" />
        </div>
      )}
    </main>
  )
}
