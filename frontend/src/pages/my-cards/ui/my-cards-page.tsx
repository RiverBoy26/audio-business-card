import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  deleteAudioCard,
  getAudioCards,
} from '@/entities/audio-card/api/audio-card-api'
import { AudioCardItem } from '@/entities/audio-card/ui/audio-card-item'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'
import { pluralizeRu } from '@/shared/lib/pluralize-ru'

export function MyCardsPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const cardsQuery = useQuery({ queryKey: ['audio-cards'], queryFn: getAudioCards })
  const cardCount = cardsQuery.data?.length ?? 0
  const deleteMutation = useMutation({
    mutationFn: deleteAudioCard,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['audio-cards'] })
    },
  })

  const visibleCards = useMemo(() => {
    const normalized = deferredQuery.trim().toLocaleLowerCase('ru')
    return (cardsQuery.data ?? []).filter((card) =>
      `${card.title} ${card.description ?? ''}`
        .toLocaleLowerCase('ru')
        .includes(normalized),
    )
  }, [cardsQuery.data, deferredQuery])

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
            {cardCount} {pluralizeRu(cardCount, 'карточка', 'карточки', 'карточек')}
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/create">
            <Plus aria-hidden="true" className="size-5" />
            Создать визитку
          </Link>
        </Button>
      </header>

      <label className="relative mt-7 block max-w-xl">
        <span className="sr-only">Найти визитку</span>
        <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию и описанию"
          value={query}
        />
      </label>

      {cardsQuery.isLoading ? (
        <div className="mt-6"><AsyncState description="Получаем ваши карточки с сервера." status="loading" title="Загружаем визитки" /></div>
      ) : cardsQuery.isError ? (
        <div className="mt-6">
          <AsyncState
            description={cardsQuery.error instanceof Error ? cardsQuery.error.message : 'Повторите запрос.'}
            onRetry={() => void cardsQuery.refetch()}
            status="error"
            title="Не удалось загрузить визитки"
          />
        </div>
      ) : visibleCards.length ? (
        <section aria-label="Список визиток" className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards.map((card) => (
            <AudioCardItem
              card={card}
              deleting={deleteMutation.isPending && deleteMutation.variables === card.id}
              key={card.id}
              onDelete={(id) => {
                if (window.confirm('Удалить эту визитку без возможности восстановления?')) {
                  deleteMutation.mutate(id)
                }
              }}
            />
          ))}
        </section>
      ) : (
        <div className="mt-6">
          <AsyncState
            description={query ? 'Измените поисковый запрос.' : 'Создайте первую визитку.'}
            status="empty"
            title="Визитки не найдены"
          />
        </div>
      )}

      {deleteMutation.isError ? (
        <p className="mt-4 text-sm text-destructive">
          {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Не удалось удалить визитку'}
        </p>
      ) : null}
    </main>
  )
}
