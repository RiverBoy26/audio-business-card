import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  deleteAudioCard,
  getAudioCards,
} from '@/entities/audio-card/api/audio-card-api'
import type { AudioCard } from '@/entities/audio-card/model/types'
import { AudioCardItem } from '@/entities/audio-card/ui/audio-card-item'
import { pluralizeRu } from '@/shared/lib/pluralize-ru'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

export function MyCardsPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [cardToDelete, setCardToDelete] = useState<AudioCard | null>(null)
  const deferredQuery = useDeferredValue(query)
  const cardsQuery = useQuery({ queryKey: ['audio-cards'], queryFn: getAudioCards })
  const cardCount = cardsQuery.data?.length ?? 0
  const deleteMutation = useMutation({
    mutationFn: deleteAudioCard,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['audio-cards'] })
      setCardToDelete(null)
    },
  })

  function closeDeleteDialog() {
    if (deleteMutation.isPending) return
    deleteMutation.reset()
    setCardToDelete(null)
  }

  const visibleCards = useMemo(() => {
    const normalized = deferredQuery.trim().toLocaleLowerCase('ru')
    return (cardsQuery.data ?? []).filter((card) =>
      `${card.title} ${card.description ?? ''}`
        .toLocaleLowerCase('ru')
        .includes(normalized),
    )
  }, [cardsQuery.data, deferredQuery])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
            Личная коллекция
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
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

      <label className="relative mt-8 block">
        <span className="sr-only">Найти визитку</span>
        <Search aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" />
        <input
          className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
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
        <section aria-label="Список визиток" className="mt-6 grid gap-5 md:grid-cols-2">
          {visibleCards.map((card) => (
            <AudioCardItem
              card={card}
              deleting={deleteMutation.isPending && deleteMutation.variables === card.id}
              key={card.id}
              onDelete={() => {
                deleteMutation.reset()
                setCardToDelete(card)
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

      <Modal className="max-w-md p-6 sm:p-7" onClose={closeDeleteDialog} open={cardToDelete !== null} title="Подтверждение удаления визитки">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 aria-hidden="true" className="size-6" />
        </div>
        <h2 className="mt-5 pr-10 text-xl font-semibold">Удалить визитку?</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Визитка <span className="font-medium text-foreground">«{cardToDelete?.title}»</span> будет удалена без возможности восстановления.
          {cardToDelete?.published ? ' Публичная версия и ссылка на неё также перестанут быть доступны.' : ''}
        </p>
        {deleteMutation.isError ? (
          <p aria-live="polite" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Не удалось удалить визитку.'}
          </p>
        ) : null}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button disabled={deleteMutation.isPending} onClick={closeDeleteDialog} type="button" variant="outline">
            Отмена
          </Button>
          <Button
            className="bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80"
            disabled={!cardToDelete || deleteMutation.isPending}
            onClick={() => cardToDelete && deleteMutation.mutate(cardToDelete.id)}
            type="button"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            {deleteMutation.isPending ? 'Удаляем…' : 'Удалить визитку'}
          </Button>
        </div>
      </Modal>
    </main>
  )
}
