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
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/45">
      <div className="flex items-start gap-3">
        {card.photoUrl ? (
          <CardImage alt="" className="size-16 rounded-lg bg-muted object-cover" src={card.photoUrl} />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-accent font-semibold text-primary">
            АВ
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{card.title}</h2>
          <p className="mt-1 text-xs text-primary">
            {card.cardType === 'RESUME' ? 'Резюме' : 'Портфолио'}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-4 min-h-20 whitespace-pre-wrap text-sm leading-5 text-muted-foreground">
        {card.description || 'Описание отсутствует.'}
      </p>

      <p className="mt-3 truncate border-t border-border pt-3 text-[11px] text-muted-foreground">
        ID: {card.id}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
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
