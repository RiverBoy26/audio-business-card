import { Download, Pause, Play } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { initialCardDraft } from '@/entities/audio-card/model/mock-data'
import { AudioWaveform } from '@/shared/ui/audio-waveform'
import { Button } from '@/shared/ui/button'
import { Tag } from '@/shared/ui/tag'

export function OpenCardPage() {
  const [code, setCode] = useState('')
  const [cardOpen, setCardOpen] = useState(false)
  const [playing, setPlaying] = useState(false)

  function findCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCardOpen(true)
  }

  if (!cardOpen) {
    return (
      <main className="mx-auto grid min-h-[calc(100svh-4rem-1px)] max-w-3xl place-items-center px-4 py-12">
        <form className="w-full max-w-xl text-center" onSubmit={findCard}>
          <h1 className="text-4xl font-bold sm:text-5xl">Введите код визитки:</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">У каждой визитки есть свой уникальный ID из 6 знаков.</p>
          <label className="mt-8 block">
            <span className="sr-only">Код визитки</span>
            <input
              className="h-16 w-full rounded-xl border border-border bg-card px-5 text-lg outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              maxLength={6}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Пример: 764536"
              required
              value={code}
            />
          </label>
          <Button className="mt-6 w-[86%]" size="lg" type="submit">Найти визитку</Button>
        </form>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Визитка <span className="align-middle text-xs font-normal text-muted-foreground">ID: {code || '845484'}</span></h1>
      <article className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
          <div className="aspect-square rounded-2xl bg-muted" />
          <div>
            <h2 className="text-3xl font-bold">{initialCardDraft.fullName}</h2>
            <p className="mt-1 text-lg">{initialCardDraft.specialty}</p>
            <p className="text-lg">Хочет работать: {initialCardDraft.desiredRole}</p>
            <p className="text-lg">Опыт работы: {initialCardDraft.experience}</p>
            <p className="mt-1 text-lg">Стек технологий:</p>
            <div className="mt-2 flex flex-wrap gap-2">{initialCardDraft.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h3 className="text-xl font-bold">Аудиовизитка</h3>
            <div className="mt-3 flex items-center gap-3">
              <button aria-label={playing ? 'Поставить аудио на паузу' : 'Воспроизвести аудио'} className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary" onClick={() => setPlaying((value) => !value)} type="button">
                {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
              </button>
              <AudioWaveform progress={playing ? 0.82 : 0.65} />
              <span className="text-xs text-muted-foreground">0:00 / 1:28</span>
            </div>
            <h3 className="mt-8 text-xl font-bold">Приложенные материалы</h3>
            <button className="mt-3 flex h-14 w-full items-center gap-3 rounded-lg border border-border px-4 text-sm" type="button">
              <img alt="PDF" className="size-8 object-contain" src="/assets/pdf.png" />
              <span className="truncate">мой_резюме.pdf</span>
              <Download className="ml-auto size-5 text-primary" />
            </button>
          </section>
          <section>
            <h3 className="text-xl font-bold">Контакты</h3>
            <div className="mt-3 min-h-36 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">mark.sokolov@example.ru<br />+7 900 123-45-67</div>
          </section>
        </div>
      </article>
    </main>
  )
}
