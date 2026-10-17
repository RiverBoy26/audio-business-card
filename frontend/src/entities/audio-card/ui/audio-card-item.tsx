import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { AudioCard } from '@/entities/audio-card/model/types'
import { CardImage } from '@/entities/audio-card/ui/card-image'
import { Button } from '@/shared/ui/button'

type AudioCardItemProps = {
  card: AudioCard
  deleting: boolean
  onDelete: (id: string) => void
}

export function AudioCardItem({ card, deleting, onDelete }: AudioCardItemProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-[1.6rem] border border-border bg-card p-5 shadow-[0_14px_45px_rgba(13,10,51,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/35">
      <div className="flex items-start gap-4">
        {card.photoUrl ? (
          <CardImage alt="" className="h-36 w-28 shrink-0 rounded-2xl bg-muted object-cover" src={card.photoUrl} />
        ) : (
          <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary/25 text-2xl font-bold text-primary">
            {(card.fullName || card.title).split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'АВ'}
          </div>
        )}
        <div className="min-w-0 py-1">
          <h2 className="truncate text-xl font-bold">{card.fullName || card.title}</h2>
          <p className="mt-1 text-sm font-medium text-primary">{card.title}</p>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {card.description || 'Описание отсутствует.'}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Портфолио</p>
        </div>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {card.published ? (
          <>
            Код визитки:{' '}
            <span className="font-medium tracking-wide text-foreground">
              {card.publicCode ?? 'формируется'}
            </span>
          </>
        ) : (
          'Черновик'
        )}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button asChild variant="outline">
          <Link to={`/cards/${card.id}/edit`}>
            <Pencil aria-hidden="true" className="size-4" />
            Изменить
          </Link>
        </Button>
        <Button disabled={deleting} onClick={() => onDelete(card.id)} variant="outline">
          <Trash2 aria-hidden="true" className="size-4" />
          Удалить
        </Button>
      </div>
    </article>
  )
}
