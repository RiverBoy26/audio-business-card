import {
  GripVertical,
  Mic,
  Music2,
  Pause,
  Play,
  Scissors,
  Upload,
  Volume2,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { AudioWaveform } from '@/shared/ui/audio-waveform'

type VoiceTrackProps = {
  duration: string
  name: string
  progress: number
}

function VoiceTrack({ duration, name, progress }: VoiceTrackProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 sm:grid-cols-[auto_auto_minmax(120px,1fr)_auto_auto]">
      <GripVertical aria-hidden="true" className="size-4 text-muted-foreground" />
      <button
        aria-label={playing ? `Поставить ${name} на паузу` : `Воспроизвести ${name}`}
        className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setPlaying((value) => !value)}
        type="button"
      >
        {playing ? (
          <Pause aria-hidden="true" className="size-3.5 fill-current" />
        ) : (
          <Play aria-hidden="true" className="ml-0.5 size-3.5 fill-current" />
        )}
      </button>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium">{name}</p>
        <AudioWaveform className="h-7" progress={progress} />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {duration}
      </span>
      <div className="hidden items-center gap-1 sm:flex">
        <Volume2 aria-hidden="true" className="size-3.5 text-muted-foreground" />
        <button
          aria-label={`Обрезать ${name}`}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          <Scissors aria-hidden="true" className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export function VoiceStoryEditor() {
  const [mode, setMode] = useState<'record' | 'upload'>('record')

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold">Голосовой рассказ</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Можно добавить несколько фрагментов и фоновую музыку.
        </p>
      </div>

      <div className="mt-4 inline-grid grid-cols-2 overflow-hidden rounded-md border border-border">
        <button
          aria-pressed={mode === 'record'}
          className={cn(
            'flex h-9 items-center gap-2 border-r border-border px-4 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
            mode === 'record' && 'bg-accent text-primary',
          )}
          onClick={() => setMode('record')}
          type="button"
        >
          <Mic aria-hidden="true" className="size-3.5" />
          Записать
        </button>
        <button
          aria-pressed={mode === 'upload'}
          className={cn(
            'flex h-9 items-center gap-2 px-4 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
            mode === 'upload' && 'bg-accent text-primary',
          )}
          onClick={() => setMode('upload')}
          type="button"
        >
          <Upload aria-hidden="true" className="size-3.5" />
          Загрузить
        </button>
      </div>

      {mode === 'upload' ? (
        <button
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground transition hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          Выберите аудиофайл или перетащите его сюда
        </button>
      ) : (
        <div className="mt-5 grid gap-4">
          <VoiceTrack duration="0:28" name="Рассказ о себе" progress={0.68} />
          <VoiceTrack duration="0:19" name="Опыт и цели" progress={0.54} />
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Music2 aria-hidden="true" className="size-4 text-primary" />
          Фоновая музыка
        </div>
        <select
          aria-label="Фоновая музыка"
          className="h-9 rounded-md border border-border bg-card px-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          defaultValue="calm"
        >
          <option value="calm">Спокойный ритм</option>
          <option value="focus">Фокус</option>
          <option value="none">Без музыки</option>
        </select>
        <div className="flex flex-1 items-center gap-2 sm:justify-end">
          <Volume2 aria-hidden="true" className="size-4 text-muted-foreground" />
          <input
            aria-label="Громкость фоновой музыки"
            className="w-full max-w-36"
            defaultValue="35"
            max="100"
            min="0"
            type="range"
          />
        </div>
      </div>
    </section>
  )
}
