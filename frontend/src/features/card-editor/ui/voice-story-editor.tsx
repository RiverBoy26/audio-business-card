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
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

type VoiceTrackProps = {
  duration: string
  name: string
  progress: number
}

type RecordStep = 'closed' | 'guide' | 'recording' | 'result'

const speechExamples = [
  {
    label: 'Бэкенд с точным стажем',
    text: 'Я бэкенд-разработчик. В работе использую Java, Spring Boot, PostgreSQL, Redis, Docker и Git. Опыт работы — два года и шесть месяцев. Хочу работать Middle Java-разработчиком.',
  },
  {
    label: 'Фронтенд с диапазоном стажа',
    text: 'Я фронтенд-разработчик. Работаю с JavaScript, TypeScript, React, React Native, GitHub и GitLab. Мой опыт — от одного года до трёх лет. Ищу работу Frontend-разработчиком.',
  },
  {
    label: 'DevOps с английскими названиями',
    text: 'Я DevOps-инженер. Использую Linux, Bash, Docker, Kubernetes, Nginx, GitLab CI/CD, Ansible и Terraform. Опыт работы — три года и семь месяцев. Хочу работать Senior DevOps-инженером.',
  },
  {
    label: 'Отрицание и дробный стаж',
    text: 'Я бэкенд-разработчик. Работаю не с Java, а с Python, Django, FastAPI и PostgreSQL. Мой стаж — полтора года. Хочу работать Python-разработчиком.',
  },
]

function VoiceTrack({ duration, name, progress }: VoiceTrackProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 sm:grid-cols-[auto_auto_minmax(120px,1fr)_auto_auto]">
      <GripVertical aria-hidden="true" className="size-4 text-muted-foreground" />
      <button
        aria-label={playing ? `Поставить ${name} на паузу` : `Воспроизвести ${name}`}
        className="flex size-8 items-center justify-center rounded-full border-2 border-primary text-primary transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      <span className="text-[11px] tabular-nums text-muted-foreground">{duration}</span>
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
  const [recordStep, setRecordStep] = useState<RecordStep>('closed')
  const [recordAdded, setRecordAdded] = useState(false)

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-xl font-semibold">Голосовая заметка</h2>

        <div className="mt-3 inline-grid grid-cols-2 overflow-hidden rounded-md border border-border">
          <button
            aria-pressed={mode === 'record'}
            className={cn(
              'flex h-9 items-center gap-2 border-r border-border px-4 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
              mode === 'record' && 'text-primary ring-1 ring-inset ring-primary',
            )}
            onClick={() => {
              setMode('record')
              setRecordStep('guide')
            }}
            type="button"
          >
            <Mic aria-hidden="true" className="size-3.5" />
            Записать
          </button>
          <button
            aria-pressed={mode === 'upload'}
            className={cn(
              'flex h-9 items-center gap-2 px-4 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
              mode === 'upload' && 'text-primary ring-1 ring-inset ring-primary',
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
            <VoiceTrack
              duration={recordAdded ? '0:39' : '0:29'}
              name={recordAdded ? 'Новая запись' : 'Рассказ о себе'}
              progress={recordAdded ? 0.78 : 0.68}
            />
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
            <input aria-label="Громкость фоновой музыки" className="w-full max-w-36" defaultValue="35" max="100" min="0" type="range" />
          </div>
        </div>
      </section>

      <Modal className="max-w-2xl" onClose={() => setRecordStep('closed')} open={recordStep === 'guide'} title="Инструкция по записи">
        <BrandLogo className="mx-auto w-fit" imageClassName="w-60" />
        <h2 className="mt-8 text-center text-3xl font-bold">Инструкция по записи</h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Говорите спокойно и назовите специальность, стек, опыт и желаемую должность.
        </p>
        <div className="mt-6 max-h-[42vh] space-y-4 overflow-y-auto pr-2">
          {speechExamples.map((example, index) => (
            <article key={example.label}>
              <h3 className="text-sm font-semibold">{index + 1}. {example.label}</h3>
              <p className="mt-2 border-l-4 border-primary/35 pl-4 text-sm leading-6 text-foreground/80">{example.text}</p>
            </article>
          ))}
        </div>
        <Button className="mt-7 w-full" onClick={() => setRecordStep('recording')} size="lg">Приступить</Button>
      </Modal>

      <Modal className="max-w-md text-center" onClose={() => setRecordStep('closed')} open={recordStep === 'recording'} title="Идёт запись">
        <BrandLogo className="mx-auto w-fit" imageClassName="w-60" />
        <h2 className="mt-12 text-3xl font-bold">Идёт запись…</h2>
        <div aria-hidden="true" className="mx-auto mt-8 flex h-24 w-40 items-end justify-center gap-2">
          {[35, 62, 84, 51, 73, 38, 82, 56].map((height, index) => (
            <span className="w-3 animate-pulse bg-border" key={`${height}-${index}`} style={{ animationDelay: `${index * 90}ms`, height: `${height}%` }} />
          ))}
        </div>
        <p className="mt-4 text-4xl font-bold tabular-nums">0:39</p>
        <Button className="mt-12 w-full" onClick={() => setRecordStep('result')} size="lg">Остановить запись</Button>
      </Modal>

      <Modal className="max-w-md text-center" onClose={() => setRecordStep('closed')} open={recordStep === 'result'} title="Запись готова">
        <BrandLogo className="mx-auto w-fit" imageClassName="w-60" />
        <h2 className="mt-12 text-3xl font-bold">Сообщение записано!</h2>
        <div className="mt-8 flex items-center gap-3">
          <button aria-label="Воспроизвести запись" className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary" type="button"><Play className="ml-0.5 size-4 fill-current" /></button>
          <AudioWaveform progress={0.7} />
        </div>
        <p className="mt-1 text-left text-xs text-muted-foreground">0:00 / 0:39</p>
        <div className="mt-12 grid gap-2">
          <Button onClick={() => setRecordStep('recording')} size="lg" variant="outline">Перезаписать</Button>
          <Button onClick={() => { setRecordAdded(true); setRecordStep('closed') }} size="lg">Добавить в визитку</Button>
        </div>
      </Modal>
    </>
  )
}
