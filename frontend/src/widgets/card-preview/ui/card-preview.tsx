import {
  Check,
  Copy,
  Download,
  Link2,
  Pause,
  Play,
  QrCode,
  Save,
  Send,
} from 'lucide-react'
import { useState } from 'react'

import type { CardDraft } from '@/entities/audio-card/model/types'
import { AudioWaveform } from '@/shared/ui/audio-waveform'
import { Button } from '@/shared/ui/button'
import { Tag } from '@/shared/ui/tag'

type CardPreviewProps = {
  draft: CardDraft
}

export function CardPreview({ draft }: CardPreviewProps) {
  const [playing, setPlaying] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 2200)
  }

  return (
    <aside className="rounded-2xl border border-border bg-card p-4 sm:p-5 lg:sticky lg:top-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-primary">Предпросмотр</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Так увидят визитку
          </h2>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
          Черновик
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-border p-4 sm:p-5">
        <div className="grid grid-cols-[72px_1fr] gap-4 sm:grid-cols-[96px_1fr]">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-accent text-xl font-semibold text-primary sm:text-2xl">
            МС
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{draft.fullName}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {draft.specialty}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Опыт: {draft.experience}
            </p>
            <p className="mt-1 truncate text-xs font-medium">
              {draft.desiredRole}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {draft.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
          <button
            aria-label={playing ? 'Поставить аудио на паузу' : 'Воспроизвести аудио'}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setPlaying((value) => !value)}
            type="button"
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-4 fill-current" />
            ) : (
              <Play aria-hidden="true" className="ml-0.5 size-4 fill-current" />
            )}
          </button>
          <AudioWaveform progress={playing ? 0.78 : 0.66} />
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            0:00 / 0:47
          </span>
        </div>
        <input
          aria-label="Позиция воспроизведения"
          className="mt-1 w-full"
          defaultValue="4"
          max="47"
          min="0"
          type="range"
        />

        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <img alt="PDF" className="size-7 shrink-0 object-contain" src="/assets/pdf.png" />
            <span className="truncate text-xs font-medium">Резюме.pdf</span>
          </div>
          <Download aria-hidden="true" className="size-4 shrink-0 text-primary" />
        </div>
        <p className="mt-2 text-right text-[10px] text-muted-foreground">ID: MK7A2</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          onClick={() => showNotice('Ссылка скопирована')}
          variant="outline"
        >
          <Link2 aria-hidden="true" className="size-4" />
          Ссылка
        </Button>
        <Button onClick={() => showNotice('QR-код подготовлен')} variant="outline">
          <QrCode aria-hidden="true" className="size-4" />
          QR-код
        </Button>
      </div>
      <div className="mt-2 grid gap-2">
        <Button onClick={() => showNotice('Черновик сохранён')} variant="outline">
          <Save aria-hidden="true" className="size-4" />
          Сохранить как черновик
        </Button>
        <Button onClick={() => showNotice('Визитка опубликована')}>
          <Send aria-hidden="true" className="size-4" />
          Опубликовать визитку
        </Button>
      </div>

      <div className="mt-3 min-h-5 text-center text-xs text-muted-foreground" aria-live="polite">
        {notice ? (
          <span className="inline-flex items-center gap-1">
            <Check aria-hidden="true" className="size-3.5 text-primary" />
            {notice}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 opacity-0">
            <Copy aria-hidden="true" className="size-3.5" />
            Готово
          </span>
        )}
      </div>
    </aside>
  )
}
