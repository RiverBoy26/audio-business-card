import { useQuery } from '@tanstack/react-query'
import { Check, Download, FileText, Link2, Pause, Play, QrCode, Save, Send, Trash2, Upload, Volume2, X } from 'lucide-react'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { QRCodeSVG } from 'qrcode.react'

import type { CardDraft } from '@/entities/audio-card/model/types'
import { getCardDocumentBlob } from '@/entities/audio-card/api/audio-card-api'
import { CardImage } from '@/entities/audio-card/ui/card-image'
import { getMusicBlob, getMusicFiles } from '@/entities/music/api/music-api'
import { getVoiceRecordingBlob, getVoiceRecordings } from '@/entities/voice-recording/api/voice-recording-api'
import { Button } from '@/shared/ui/button'
import { AudioWaveform } from '@/shared/ui/audio-waveform'

type CardPreviewProps = {
  cardId?: string
  draft: CardDraft
  error?: string | null
  isPublishing: boolean
  isSaving: boolean
  isDocumentDeleting: boolean
  onDocumentDelete: () => void
  onDocumentSelect: (file: File) => void
  onDraftChange: Dispatch<SetStateAction<CardDraft>>
  onPublish: () => void
  onSave: () => void
  onUnpublish: () => void
  saved: boolean
}

function getInitials(name: string) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('')
  return initials.toUpperCase() || 'АВ'
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function CardAudioPreview({ draft, onChange }: { draft: CardDraft; onChange: Dispatch<SetStateAction<CardDraft>> }) {
  const musicQuery = useQuery({ queryKey: ['music'], queryFn: getMusicFiles })
  const voiceQuery = useQuery({ queryKey: ['voice-recordings'], queryFn: getVoiceRecordings })
  const playersRef = useRef<{ key: string; items: HTMLAudioElement[]; urls: string[] } | null>(null)
  const requestRef = useRef(0)
  const [playingKey, setPlayingKey] = useState<string | null>(null)
  const [position, setPosition] = useState({ key: '', current: 0, duration: 0 })
  const [error, setError] = useState<string | null>(null)
  const key = `${draft.voiceRecordingId ?? ''}|${draft.musicId ?? ''}`
  const recording = voiceQuery.data?.find((item) => item.id === draft.voiceRecordingId)
  const music = musicQuery.data?.find((item) => item.id === draft.musicId)
  const canPlay = Boolean(recording || music)
  const current = position.key === key ? position.current : 0
  const duration = position.key === key ? position.duration : 0
  const isPlaying = playingKey === key

  useEffect(() => {
    requestRef.current += 1
    const players = playersRef.current
    players?.items.forEach((item) => item.pause())
    players?.urls.forEach((url) => URL.revokeObjectURL(url))
    playersRef.current = null
    return () => {
      requestRef.current += 1
      const currentPlayers = playersRef.current
      currentPlayers?.items.forEach((item) => item.pause())
      currentPlayers?.urls.forEach((url) => URL.revokeObjectURL(url))
      playersRef.current = null
    }
  }, [key])

  useEffect(() => {
    const players = playersRef.current
    if (!players || players.key !== key) return
    if (recording) players.items[0].volume = draft.voiceVolume / 100
    if (music) players.items[players.items.length - 1].volume = draft.musicVolume / 100
  }, [draft.voiceVolume, draft.musicVolume, key, recording, music])

  async function togglePlayback() {
    if (isPlaying) {
      playersRef.current?.items.forEach((item) => item.pause())
      setPlayingKey(null)
      return
    }
    setError(null)
    const request = requestRef.current
    try {
      let players = playersRef.current
      if (!players || players.key !== key) {
        const [voiceBlob, musicBlob] = await Promise.all([
          recording ? getVoiceRecordingBlob(recording) : Promise.resolve(null),
          music ? getMusicBlob(music) : Promise.resolve(null),
        ])
        if (request !== requestRef.current) return
        const urls = [voiceBlob, musicBlob].filter((blob): blob is Blob => blob !== null).map((blob) => URL.createObjectURL(blob))
        const items = urls.map((url) => new Audio(url))
        if (!items.length) return
        if (voiceBlob && musicBlob) items[1].loop = true
        if (voiceBlob) items[0].volume = draft.voiceVolume / 100
        if (musicBlob) items[items.length - 1].volume = draft.musicVolume / 100
        const primary = items[0]
        primary.ontimeupdate = () => setPosition({ key, current: primary.currentTime, duration: primary.duration || 0 })
        primary.onloadedmetadata = () => setPosition({ key, current: primary.currentTime, duration: primary.duration || 0 })
        primary.onended = () => {
          items.forEach((item) => item.pause())
          setPlayingKey(null)
        }
        players = { key, items, urls }
        playersRef.current = players
      }
      await Promise.all(players.items.map((item) => item.play()))
      if (request === requestRef.current) setPlayingKey(key)
    } catch {
      playersRef.current?.items.forEach((item) => item.pause())
      setPlayingKey(null)
      setError('Не удалось воспроизвести аудио.')
    }
  }

  function seek(percent: number) {
    const players = playersRef.current
    if (!players || !duration) return
    const nextTime = duration * percent / 100
    players.items[0].currentTime = nextTime
    if (players.items.length > 1 && Number.isFinite(players.items[1].duration) && players.items[1].duration > 0) {
      players.items[1].currentTime = nextTime % players.items[1].duration
    }
    setPosition({ key, current: nextTime, duration })
  }

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex items-center gap-3">
        <button aria-label={isPlaying ? 'Пауза' : 'Воспроизвести аудио визитки'} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-45" disabled={!canPlay} onClick={() => void togglePlayback()} type="button">{isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}</button>
        <AudioWaveform className="h-11" progress={duration ? current / duration : 0} />
        <span className="shrink-0 text-[10px] text-muted-foreground">{formatDuration(current)} / {formatDuration(duration)}</span>
      </div>
      <label className="mt-2 block text-[11px] text-muted-foreground">
        <span>Позиция воспроизведения</span>
        <input aria-label="Позиция воспроизведения" className="mt-1 w-full" disabled={!duration} max={100} min={0} onChange={(event) => seek(Number(event.target.value))} type="range" value={duration ? Math.round(current / duration * 100) : 0} />
      </label>
      <p className="mt-1 text-[11px] text-muted-foreground">{recording && music ? 'Голос и музыка воспроизводятся вместе' : recording ? 'Только голос' : music ? 'Только фоновая музыка' : 'Выберите музыку или добавьте голос'}</p>
      {recording || music ? (
        <div className="mt-3 grid gap-2 rounded-lg bg-muted/60 p-3">
          {recording ? <label className="grid grid-cols-[70px_1fr_34px] items-center gap-2 text-[11px]"><span className="inline-flex items-center gap-1"><Volume2 className="size-3.5" />Голос</span><input aria-label="Громкость голоса в предпросмотре" max={100} min={0} onChange={(event) => onChange((currentDraft) => ({ ...currentDraft, voiceVolume: Number(event.target.value) }))} type="range" value={draft.voiceVolume} /><span className="text-right tabular-nums text-muted-foreground">{draft.voiceVolume}%</span></label> : null}
          {music ? <label className="grid grid-cols-[70px_1fr_34px] items-center gap-2 text-[11px]"><span className="inline-flex items-center gap-1"><Volume2 className="size-3.5" />Музыка</span><input aria-label="Громкость музыки в предпросмотре" max={100} min={0} onChange={(event) => onChange((currentDraft) => ({ ...currentDraft, musicVolume: Number(event.target.value) }))} type="range" value={draft.musicVolume} /><span className="text-right tabular-nums text-muted-foreground">{draft.musicVolume}%</span></label> : null}
        </div>
      ) : null}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export function CardPreview({ cardId, draft, error, isDocumentDeleting, isPublishing, isSaving, onDocumentDelete, onDocumentSelect, onDraftChange, onPublish, onSave, onUnpublish, saved }: CardPreviewProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  const publicUrl = cardId ? `${window.location.origin}/card/${cardId}` : ''
  const positionLabel = draft.cardType === 'RESUME'
    ? 'Желаемая должность'
    : 'Желаемая роль в команде'
  const documentLabel = draft.cardType === 'RESUME'
    ? 'Прикрепить резюме в PDF'
    : 'Прикрепить портфолио в PDF'

  async function copyPublicLink() {
    if (!cardId || !draft.published) return
    const url = publicUrl
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('textarea')
      input.value = url
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 2500)
  }

  function selectDocument(file: File | undefined) {
    if (!file) return
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setDocumentError('Можно загрузить только PDF-файл.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocumentError('Размер PDF-файла не должен превышать 10 МБ.')
      return
    }
    setDocumentError(null)
    onDocumentSelect(file)
  }

  async function downloadDocument() {
    setDocumentError(null)
    try {
      const blob = draft.documentFile
        ?? (draft.documentUrl ? await getCardDocumentBlob(draft.documentUrl) : null)
      if (!blob) throw new Error('PDF-файл недоступен')
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = draft.documentName ?? 'document.pdf'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch {
      setDocumentError('Не удалось скачать PDF-файл.')
    }
  }

  return (
    <aside className="min-w-0 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Предпросмотр</h2>
        <span className={`rounded-lg px-3 py-1.5 text-[11px] ${draft.published ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground'}`}>{draft.published ? 'Опубликовано' : 'Черновик'}</span>
      </div>

      <div className="mt-5 rounded-xl border border-border p-5">
        <div className="flex items-start gap-4">
          {draft.photoUrl ? <CardImage alt="" className="size-24 shrink-0 rounded-xl bg-muted object-cover" src={draft.photoUrl} /> : <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl font-medium text-primary">{getInitials(draft.fullName)}</div>}
          <div className="min-w-0 pt-1">
            <h3 className="truncate text-lg font-semibold">{draft.fullName || 'Имя Фамилия'}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{draft.description || 'Специализация'}</p>
            <p className="mt-2 text-xs text-muted-foreground">Опыт: {draft.experienceYears || 0} {draft.experienceYears === 1 ? 'год' : 'лет'}</p>
            <p className="mt-1 text-xs">
              <span className="text-muted-foreground">{positionLabel}: </span>
              <span className="font-medium">{draft.title || 'не указана'}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {draft.skills.length ? draft.skills.map((skill) => <span className="rounded-lg bg-accent px-2.5 py-1.5 text-xs" key={skill}>{skill}</span>) : <span className="text-xs text-muted-foreground">Стек не указан</span>}
        </div>

        <CardAudioPreview draft={draft} onChange={onDraftChange} />

        <input
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => {
            selectDocument(event.target.files?.[0])
            event.target.value = ''
          }}
          ref={documentInputRef}
          type="file"
        />
        {draft.documentName ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border px-4 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-destructive"><FileText className="size-4" /></span>
            <button className="min-w-0 flex-1 truncate text-left text-xs hover:text-primary" onClick={() => documentInputRef.current?.click()} title="Заменить PDF-файл" type="button">{draft.documentName}</button>
            <button aria-label="Скачать PDF-файл" className="text-primary transition hover:opacity-70" onClick={() => void downloadDocument()} title="Скачать PDF-файл" type="button"><Download className="size-4" /></button>
            <button aria-label="Удалить PDF-файл" className="text-destructive transition hover:opacity-70 disabled:opacity-40" disabled={isDocumentDeleting} onClick={onDocumentDelete} title="Удалить PDF-файл" type="button"><Trash2 className="size-4" /></button>
          </div>
        ) : (
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground transition hover:border-primary hover:text-primary" onClick={() => documentInputRef.current?.click()} type="button">
            <Upload className="size-4" />{documentLabel}
          </button>
        )}
        {documentError ? <p className="mt-2 text-xs text-destructive">{documentError}</p> : null}
        <p className="mt-2 text-right text-[10px] text-muted-foreground">Тип: {draft.cardType === 'RESUME' ? 'Резюме' : 'Портфолио'}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button disabled={!draft.published || !cardId} onClick={() => void copyPublicLink()} variant="outline"><Link2 className="size-4" />{linkCopied ? 'Скопировано' : 'Ссылка'}</Button>
        <Button disabled={!draft.published || !cardId} onClick={() => setQrOpen(true)} variant="outline"><QrCode className="size-4" />QR-код</Button>
      </div>
      <Button className="mt-2 w-full" disabled={isSaving || isPublishing || !draft.title.trim()} onClick={onSave} variant="outline"><Save className="size-4" />{isSaving ? 'Сохраняем…' : 'Сохранить как черновик'}</Button>
      <Button className="mt-2 w-full" disabled={isPublishing || isSaving || !draft.title.trim()} onClick={draft.published ? onUnpublish : onPublish}><Send className="size-4" />{isPublishing ? (draft.published ? 'Отменяем публикацию…' : 'Публикуем…') : draft.published ? 'Отменить публикацию' : 'Опубликовать визитку'}</Button>

      {draft.published && draft.publicCode ? <p className="mt-3 text-center text-sm font-bold text-foreground">Код визитки: {draft.publicCode}</p> : null}

      <p aria-live="polite" className={`mt-3 min-h-5 text-center text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
        {error ? error : linkCopied ? <span className="inline-flex items-center gap-1"><Check className="size-3.5 text-primary" />Публичная ссылка скопирована</span> : saved ? <span className="inline-flex items-center gap-1"><Check className="size-3.5 text-primary" />Изменения сохранены</span> : null}
      </p>

      {qrOpen && publicUrl ? (
        <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) setQrOpen(false) }} role="dialog">
          <div className="relative w-full max-w-sm rounded-2xl bg-card p-7 text-center shadow-xl">
            <button aria-label="Закрыть QR-код" className="absolute right-4 top-4 text-muted-foreground transition hover:text-foreground" onClick={() => setQrOpen(false)} type="button"><X className="size-5" /></button>
            <h2 className="text-2xl font-semibold">QR-код визитки</h2>
            <p className="mt-2 text-sm text-muted-foreground">Отсканируйте код, чтобы открыть опубликованную визитку.</p>
            <div className="mx-auto mt-6 w-fit rounded-xl border border-border bg-white p-4">
              <QRCodeSVG level="M" size={220} value={publicUrl} />
            </div>
            {draft.publicCode ? <p className="mt-4 text-base font-bold text-foreground">Код визитки: {draft.publicCode}</p> : null}
          </div>
        </div>
      ) : null}
    </aside>
  )
}
