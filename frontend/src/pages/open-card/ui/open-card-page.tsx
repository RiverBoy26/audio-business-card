import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Pause, Play } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getPublicAudioCard, getPublicAudioCardByCode, getPublicCardMedia } from '@/entities/audio-card/api/audio-card-api'
import type { PublicAudioCard } from '@/entities/audio-card/model/types'
import { CardImage } from '@/entities/audio-card/ui/card-image'
import { Button } from '@/shared/ui/button'
import { AudioWaveform } from '@/shared/ui/audio-waveform'
import { AsyncState } from '@/shared/ui/async-state'

function initials(name: string | null) {
  return (name ?? '').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'АВ'
}

function duration(value: number) {
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`
}

function PublicAudioPlayer({ card }: { card: PublicAudioCard }) {
  const playersRef = useRef<{ players: HTMLAudioElement[]; urls: string[] } | null>(null)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState({ current: 0, duration: 0 })
  const [error, setError] = useState<string | null>(null)
  const canPlay = Boolean(card.voiceUrl || card.musicUrl)

  useEffect(() => () => {
    playersRef.current?.players.forEach((player) => player.pause())
    playersRef.current?.urls.forEach(URL.revokeObjectURL)
  }, [])

  async function toggle() {
    if (playing) {
      playersRef.current?.players.forEach((player) => player.pause())
      setPlaying(false)
      return
    }
    setError(null)
    try {
      let state = playersRef.current
      if (!state) {
        const [voice, music] = await Promise.all([
          card.voiceUrl ? getPublicCardMedia(card.voiceUrl) : Promise.resolve(null),
          card.musicUrl ? getPublicCardMedia(card.musicUrl) : Promise.resolve(null),
        ])
        const urls = [voice, music].filter((blob): blob is Blob => blob !== null).map(URL.createObjectURL)
        const players = urls.map((url) => new Audio(url))
        if (voice) players[0].volume = card.voiceVolume / 100
        if (music) players[players.length - 1].volume = card.musicVolume / 100
        if (voice && music) players[1].loop = true
        const primary = players[0]
        primary.ontimeupdate = () => setPosition({ current: primary.currentTime, duration: primary.duration || 0 })
        primary.onloadedmetadata = primary.ontimeupdate
        primary.onended = () => {
          players.forEach((player) => player.pause())
          setPlaying(false)
        }
        state = { players, urls }
        playersRef.current = state
      }
      await Promise.all(state.players.map((player) => player.play()))
      setPlaying(true)
    } catch {
      setPlaying(false)
      setError('Не удалось воспроизвести аудио.')
    }
  }

  function seek(percent: number) {
    const state = playersRef.current
    if (!state || !position.duration) return
    const next = position.duration * percent / 100
    state.players[0].currentTime = next
    if (state.players.length > 1 && state.players[1].duration) state.players[1].currentTime = next % state.players[1].duration
    setPosition((current) => ({ ...current, current: next }))
  }

  return (
    <div className="mt-3">
      <div className="flex min-h-12 items-center gap-3">
        <button aria-label={playing ? 'Пауза' : 'Воспроизвести'} className="flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-card text-primary transition hover:bg-accent disabled:border-border disabled:text-muted-foreground disabled:opacity-60" disabled={!canPlay} onClick={() => void toggle()} type="button">
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
        </button>
        <AudioWaveform className="h-10 min-w-0 flex-1" progress={canPlay ? Math.max(position.duration ? position.current / position.duration : 0, 0.62) : 0} />
        <span className="shrink-0 text-[10px] text-foreground/75">{duration(position.current)} / {duration(position.duration)}</span>
      </div>
      <input aria-label="Позиция аудио" className="sr-only" disabled={!position.duration} max={100} min={0} onChange={(event) => seek(Number(event.target.value))} type="range" value={position.duration ? position.current / position.duration * 100 : 0} />
      {!canPlay ? <p className="mt-1 text-xs text-muted-foreground">Автор пока не добавил аудио.</p> : null}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

function PublicDocument({ card }: { card: PublicAudioCard }) {
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  async function download() {
    if (!card.documentUrl) return
    setDownloading(true)
    setError(null)
    try {
      const blob = await getPublicCardMedia(card.documentUrl)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = card.documentName ?? 'document.pdf'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Не удалось скачать PDF-файл.')
    } finally {
      setDownloading(false)
    }
  }

  if (!card.documentUrl || !card.documentName) return null
  return (
    <section className="mt-5">
      <h2 className="text-xl font-semibold sm:text-2xl">Приложенные материалы</h2>
      <div className="mt-2 flex min-h-14 items-center gap-4 rounded-xl border border-border px-4 py-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-destructive"><FileText className="size-5" /></span>
        <span className="min-w-0 flex-1 truncate text-sm">{card.documentName}</span>
        <button aria-label="Скачать PDF-файл" className="text-primary disabled:opacity-50" disabled={downloading} onClick={() => void download()} type="button"><Download className="size-5" /></button>
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </section>
  )
}

export function PublicCardPage() {
  const { cardId = '' } = useParams()
  const query = useQuery({ queryKey: ['public-audio-card', cardId], queryFn: () => getPublicAudioCard(cardId), retry: false })

  if (query.isLoading) return <main className="mx-auto max-w-2xl px-4 py-16"><AsyncState description="Получаем опубликованную карточку." status="loading" title="Открываем визитку" /></main>
  if (query.isError || !query.data) return <main className="mx-auto max-w-2xl px-4 py-16"><AsyncState description="Ссылка неверна, карточка удалена или ещё не опубликована." status="error" title="Визитка недоступна" /></main>

  const card = query.data
  return (
    <main className="mx-auto min-h-[calc(100svh-4rem-1px)] w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex items-end gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Визитка</h1>
        <span className="mb-1 text-xs text-foreground/70">ID:{card.publicCode}</span>
      </div>

      <article className="mt-3 w-full rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 md:grid-cols-[165px_minmax(0,1fr)] md:gap-9">
          {card.photoUrl
            ? <CardImage alt={card.fullName ?? 'Фото автора'} className="h-[215px] w-[165px] rounded-[20px] bg-muted object-cover" src={card.photoUrl} />
            : <div className="flex h-[215px] w-[165px] items-center justify-center rounded-[20px] bg-muted text-3xl font-medium text-primary">{initials(card.fullName)}</div>}
          <div className="min-w-0 self-center">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{card.fullName || 'Автор визитки'}</h2>
            <p className="mt-1 text-lg leading-7">{card.description || 'Специализация не указана'}</p>
            <p className="text-lg leading-7">Хочет работать: {card.title}</p>
            <p className="text-lg leading-7">Опыт работы: {card.experienceYears} {card.experienceYears === 1 ? 'год' : 'лет'}</p>
            <p className="text-lg leading-7">Стек технологий:</p>
            <div className="mt-1.5 flex flex-wrap gap-2.5">
              {card.skills.length
                ? card.skills.map((skill) => <span className="min-w-[104px] rounded-md border border-border px-3 py-1 text-center text-sm font-semibold" key={skill}>{skill}</span>)
                : <span className="text-sm text-muted-foreground">Не указан</span>}
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-16">
          <div>
            <section>
              <h2 className="text-xl font-semibold sm:text-2xl">Аудиовизитка</h2>
              <PublicAudioPlayer card={card} />
            </section>

            <PublicDocument card={card} />
          </div>

          <section>
            <h2 className="text-xl font-semibold sm:text-2xl">Контакты</h2>
            <div aria-label="Контакты будут добавлены позже" className="mt-3 min-h-40 rounded-2xl border border-border bg-card" />
          </section>
        </div>
      </article>
    </main>
  )
}

export function OpenCardPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit(event: FormEvent) {
    event.preventDefault()
    const value = code.trim().split('/').filter(Boolean).pop()?.toUpperCase()
    if (!value) return
    setError(null)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
      navigate(`/card/${value}`)
      return
    }
    if (!/^[A-Z0-9]{6}$/.test(value)) {
      setError('Введите шестизначный код из букв и цифр или публичную ссылку.')
      return
    }
    setOpening(true)
    try {
      const card = await getPublicAudioCardByCode(value)
      navigate(`/card/${card.id}`)
    } catch {
      setError('Визитка с таким кодом не найдена или не опубликована.')
    } finally {
      setOpening(false)
    }
  }
  return (
    <main className="mx-auto grid min-h-[calc(100svh-4rem-1px)] max-w-xl place-items-center px-4 py-12">
      <form className="w-full rounded-2xl border border-border bg-card p-6 text-center sm:p-10" onSubmit={submit}>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Публичные визитки</p>
        <h1 className="mt-3 text-3xl font-bold">Открыть визитку</h1>
        <p className="mt-3 text-sm text-muted-foreground">Вставьте публичную ссылку или идентификатор визитки.</p>
        <input aria-label="Ссылка или код визитки" autoCapitalize="characters" className="mt-6 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring" onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Например, A7K3M9" value={code} />
        <Button className="mt-3 w-full" disabled={!code.trim() || opening} type="submit">{opening ? 'Открываем…' : 'Открыть'}</Button>
        <p aria-live="polite" className="mt-3 min-h-5 text-xs text-destructive">{error}</p>
      </form>
    </main>
  )
}
