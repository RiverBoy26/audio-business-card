import { Plus, Search } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { audioCards } from '@/entities/audio-card/model/mock-data'
import type { CardStatus } from '@/entities/audio-card/model/types'
import { AudioCardItem } from '@/entities/audio-card/ui/audio-card-item'
import { cn } from '@/shared/lib/cn'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'

type Filter = 'all' | CardStatus

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'published', label: 'Опубликованные' },
  { id: 'draft', label: 'Черновики' },
]

export function MyCardsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const deferredQuery = useDeferredValue(query)

  const visibleCards = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase('ru')
    const result = audioCards.filter((card) => {
      const matchesFilter = filter === 'all' || card.status === filter
      const matchesQuery =
        !normalizedQuery ||
        `${card.title} ${card.specialty} ${card.skills.join(' ')}`
          .toLocaleLowerCase('ru')
          .includes(normalizedQuery)

      return matchesFilter && matchesQuery
    })

    return sort === 'oldest' ? result.toReversed() : result
  }, [deferredQuery, filter, sort])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Личная коллекция
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Мои визитки
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {audioCards.length} визитки
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/create">
            <Plus aria-hidden="true" className="size-5" />
            Создать визитку
          </Link>
        </Button>
      </header>

      <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_minmax(360px,0.95fr)]">
        <div className="grid grid-cols-3 overflow-hidden rounded-md border border-border bg-card">
          {filters.map((item) => (
            <button
              aria-pressed={filter === item.id}
              className={cn(
                'h-10 border-r border-border px-2 text-xs font-medium transition last:border-r-0 hover:bg-muted focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:text-sm',
                filter === item.id && 'bg-accent text-primary',
              )}
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label className="relative">
            <span className="sr-only">Найти визитку</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Найти визитку"
              value={query}
            />
          </label>
          <select
            aria-label="Сортировка"
            className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            onChange={(event) => setSort(event.target.value)}
            value={sort}
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>
      </div>

      {visibleCards.length > 0 ? (
        <section
          aria-label="Список визиток"
          className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleCards.map((card) => (
            <AudioCardItem card={card} key={card.id} />
          ))}
        </section>
      ) : (
        <div className="mt-5">
          <AsyncState
            description="Измените поисковый запрос или выберите другой фильтр."
            onRetry={() => {
              setQuery('')
              setFilter('all')
            }}
            status="empty"
            title="Визитки не найдены"
          />
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Черновики видны только вам, пока вы их не опубликуете.
      </p>
    </main>
  )
}
