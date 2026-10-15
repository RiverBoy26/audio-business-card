import {
  Copy,
  Download,
  FilePlus2,
  FileText,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Send,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { AudioCard } from '@/entities/audio-card/model/types'
import { cn } from '@/shared/lib/cn'
import { AudioWaveform } from '@/shared/ui/audio-waveform'
import { Button } from '@/shared/ui/button'
import { Tag } from '@/shared/ui/tag'

type AudioCardItemProps = {
  card: AudioCard
}

export function AudioCardItem({ card }: AudioCardItemProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/45">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{card.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{card.kind}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={cn(
              'rounded-md px-2 py-1 text-[11px] font-medium',
              card.status === 'published'
                ? 'bg-accent text-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {card.status === 'published' ? 'Опубликована' : 'Черновик'}
          </span>
          <button
            aria-label={`Меню визитки ${card.title}`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          >
            <MoreVertical aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[76px_1fr] gap-3">
        <div className="flex aspect-square items-center justify-center rounded-lg bg-accent text-lg font-semibold text-primary">
          МС
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{card.fullName}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {card.specialty}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Опыт: {card.experience}
          </p>
          <div className="mt-2 flex max-h-7 flex-wrap gap-1 overflow-hidden">
            {card.skills.slice(0, 3).map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <button
          aria-label={playing ? 'Поставить аудио на паузу' : 'Воспроизвести аудио'}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => setPlaying((value) => !value)}
          type="button"
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-3.5 fill-current" />
          ) : (
            <Play aria-hidden="true" className="ml-0.5 size-3.5 fill-current" />
          )}
        </button>
        <AudioWaveform className="h-8" progress={playing ? 0.82 : 0.63} />
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {card.duration}
        </span>
      </div>

      <button
        className="mt-3 flex h-10 items-center justify-between rounded-md border border-border px-3 text-xs font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          {card.pdfName ? (
            <FileText aria-hidden="true" className="size-4 shrink-0 text-primary" />
          ) : (
            <FilePlus2 aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{card.pdfName ?? 'Добавить PDF'}</span>
        </span>
        {card.pdfName ? (
          <Download aria-hidden="true" className="size-4 text-muted-foreground" />
        ) : null}
      </button>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          ID: {card.id}
          <Copy aria-hidden="true" className="size-3.5" />
        </span>
        <span>{card.updatedAt}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button asChild variant="outline">
          <Link to="/create">
            <Pencil aria-hidden="true" className="size-4" />
            {card.status === 'draft' ? 'Продолжить' : 'Изменить'}
          </Link>
        </Button>
        <Button disabled={card.status === 'draft'}>
          <Send aria-hidden="true" className="size-4" />
          Поделиться
        </Button>
      </div>
    </article>
  )
}
