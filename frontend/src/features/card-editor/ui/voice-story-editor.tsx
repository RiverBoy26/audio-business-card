import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CloudUpload, Mic, Pause, Play, Scissors, Square, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'

import type { CardDraft } from '@/entities/audio-card/model/types'
import { getMusicBlob, getMusicFiles, uploadMusic } from '@/entities/music/api/music-api'
import { getVoiceRecordingBlob, getVoiceRecordings, uploadVoiceRecording, type VoiceRecording } from '@/entities/voice-recording/api/voice-recording-api'
import { clampTrimEnd, clampTrimStart, joinVoiceParts, trimVoicePart } from '@/features/card-editor/lib/voice-audio'
import { uniqueMusicFiles } from '@/features/card-editor/lib/unique-music-files'
import { announcePlayback, createPlaybackOwner, onOtherPlayback } from '@/shared/lib/audio-playback'
import { formatDuration, normalizeDuration } from '@/shared/lib/format-duration'
import { AudioWaveform } from '@/shared/ui/audio-waveform'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

type VoiceStoryEditorProps = { draft: CardDraft; onChange: Dispatch<SetStateAction<CardDraft>> }

function extensionForMime(mimeType: string) {
  if (mimeType.includes('ogg')) return 'ogg'
  if (mimeType.includes('wav')) return 'wav'
  return 'webm'
}

function musicDisplayName(filename: string) {
  return filename.replace(/\.[^.]+$/, '')
}

function moveAudioTo(player: HTMLAudioElement, seconds: number) {
  player.currentTime = seconds
}

export function VoiceStoryEditor({ draft, onChange }: VoiceStoryEditorProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const musicInputRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const cancelAfterStopRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackUrlRef = useRef<string | null>(null)
  const musicAudioRef = useRef<HTMLAudioElement | null>(null)
  const musicUrlRef = useRef<string | null>(null)
  const musicRequestRef = useRef(0)
  const voiceRequestRef = useRef(0)
  const playbackOwnerRef = useRef(createPlaybackOwner())
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recordedFile, setRecordedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [voicePosition, setVoicePosition] = useState({ current: 0, duration: 0 })
  const [musicPlayingId, setMusicPlayingId] = useState<string | null>(null)
  const [musicDuration, setMusicDuration] = useState(0)
  const [musicError, setMusicError] = useState<string | null>(null)
  const [dialogStage, setDialogStage] = useState<'recording' | 'review' | null>(null)
  const [recorderError, setRecorderError] = useState<string | null>(null)
  const [trimOpen, setTrimOpen] = useState(false)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const voiceQuery = useQuery({ queryKey: ['voice-recordings'], queryFn: getVoiceRecordings })
  const musicQuery = useQuery({ queryKey: ['music'], queryFn: getMusicFiles })
  const availableMusic = uniqueMusicFiles(musicQuery.data ?? [], draft.musicId)
  const systemMusic = availableMusic.filter((file) => file.system)
  const userMusic = availableMusic.filter((file) => !file.system)
  const musicPlaying = Boolean(draft.musicId && musicPlayingId === draft.musicId)
  const musicUploadMutation = useMutation({
    mutationFn: uploadMusic,
    onSuccess: async (file) => {
      setMusicDuration(0)
      onChange((current) => ({ ...current, musicId: file.id, musicStartSeconds: 0 }))
      await queryClient.invalidateQueries({ queryKey: ['music'] })
    },
  })
  const uploadMutation = useMutation({
    mutationFn: async ({ file, mode }: { file: File; mode: 'append' | 'replace' }) => {
      let currentRecording = voiceQuery.data?.find((item) => item.id === draft.voiceRecordingId)
      if (mode === 'append' && draft.voiceRecordingId && !currentRecording) {
        const recordings = await queryClient.fetchQuery({ queryKey: ['voice-recordings'], queryFn: getVoiceRecordings })
        currentRecording = recordings.find((item) => item.id === draft.voiceRecordingId)
        if (!currentRecording) throw new Error('Не удалось загрузить текущую запись для объединения. Попробуйте ещё раз.')
      }
      const parts: Blob[] = []
      if (mode === 'append' && currentRecording) {
        parts.push(await getVoiceRecordingBlob(currentRecording))
      }
      parts.push(file)
      const prepared = await joinVoiceParts(parts)
      return uploadVoiceRecording(prepared.file, prepared.durationSeconds)
    },
    onSuccess: (recording) => {
      queryClient.setQueryData<VoiceRecording[]>(['voice-recordings'], (current) => [
        recording,
        ...(current ?? []).filter((item) => item.id !== recording.id),
      ])
      onChange((current) => ({ ...current, voiceRecordingId: recording.id }))
      setRecordedFile(null)
      setDuration(0)
      setVoicePosition({ current: 0, duration: recording.durationSeconds })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setDialogStage(null)
      setTrimOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['voice-recordings'] })
    },
  })

  const trimMutation = useMutation({
    mutationFn: async (recording: VoiceRecording) => {
      const source = await getVoiceRecordingBlob(recording)
      const prepared = await trimVoicePart(source, trimStart, trimEnd)
      return uploadVoiceRecording(prepared.file, prepared.durationSeconds)
    },
    onSuccess: (recording) => {
      queryClient.setQueryData<VoiceRecording[]>(['voice-recordings'], (current) => [
        recording,
        ...(current ?? []).filter((item) => item.id !== recording.id),
      ])
      onChange((current) => ({ ...current, voiceRecordingId: recording.id }))
      setTrimOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['voice-recordings'] })
    },
  })

  useEffect(() => {
    if (!isRecording) return
    const timer = window.setInterval(() => setDuration((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [isRecording])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    audioRef.current?.pause()
    if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current)
    musicAudioRef.current?.pause()
    if (musicUrlRef.current) URL.revokeObjectURL(musicUrlRef.current)
  }, [])

  useEffect(() => onOtherPlayback(playbackOwnerRef.current, () => {
    voiceRequestRef.current += 1
    musicRequestRef.current += 1
    audioRef.current?.pause()
    musicAudioRef.current?.pause()
    setPlaying(false)
    setMusicPlayingId(null)
  }), [])

  useEffect(() => {
    musicRequestRef.current += 1
    musicAudioRef.current?.pause()
    musicAudioRef.current = null
    if (musicUrlRef.current) URL.revokeObjectURL(musicUrlRef.current)
    musicUrlRef.current = null
  }, [draft.musicId])

  useEffect(() => {
    if (musicAudioRef.current) musicAudioRef.current.volume = draft.musicVolume / 100
  }, [draft.musicVolume])

  useEffect(() => {
    const audio = musicAudioRef.current
    if (!audio || !musicDuration) return
    const maximumStart = Math.max(0, Math.floor(musicDuration - 0.1))
    const nextStart = Math.min(draft.musicStartSeconds, maximumStart)
    audio.currentTime = nextStart
    if (nextStart !== draft.musicStartSeconds) {
      onChange((current) => ({ ...current, musicStartSeconds: nextStart }))
    }
  }, [draft.musicStartSeconds, musicDuration, onChange])

  async function startRecording() {
    setRecorderError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecorderError('Браузер не поддерживает запись с микрофона.')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
        },
      })
      const preferredType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined)
      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      setDuration(0)
      setRecordedFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      })
      recorder.addEventListener('stop', () => {
        if (cancelAfterStopRef.current) {
          cancelAfterStopRef.current = false
          chunksRef.current = []
          stream.getTracks().forEach((track) => track.stop())
          streamRef.current = null
          return
        }
        const mimeType = recorder.mimeType || chunksRef.current[0]?.type || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const file = new File([blob], `voice-${new Date().toISOString().replaceAll(':', '-')}.${extensionForMime(mimeType)}`, { type: mimeType })
        setRecordedFile(file)
        setPreviewUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setDialogStage('review')
      }, { once: true })
      recorder.start(250)
      setIsRecording(true)
      return true
    } catch (error) {
      setRecorderError(error instanceof DOMException && error.name === 'NotAllowedError' ? 'Разрешите доступ к микрофону в настройках браузера.' : 'Не удалось начать запись с микрофона.')
      streamRef.current?.getTracks().forEach((track) => track.stop())
      return false
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop()
    setIsRecording(false)
  }

  function cancelRecording() {
    cancelAfterStopRef.current = true
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    setIsRecording(false)
    setDuration(0)
    setDialogStage(null)
  }

  async function recordAgain() {
    audioRef.current?.pause()
    setPlaying(false)
    setRecordedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setDialogStage(null)
    if (await startRecording()) setDialogStage('recording')
  }

  async function togglePlayback(recording?: VoiceRecording) {
    if (playing) {
      voiceRequestRef.current += 1
      audioRef.current?.pause()
      setPlaying(false)
      return
    }
    const request = ++voiceRequestRef.current
    try {
      musicAudioRef.current?.pause()
      setMusicPlayingId(null)
      audioRef.current?.pause()
      let source = previewUrl
      if (!source && recording) {
        if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current)
        source = URL.createObjectURL(await getVoiceRecordingBlob(recording))
        if (request !== voiceRequestRef.current) {
          URL.revokeObjectURL(source)
          return
        }
        playbackUrlRef.current = source
      }
      if (!source) return
      let audio = audioRef.current
      if (!audio || audio.src !== source) {
        audio?.pause()
        const createdAudio = new Audio(source)
        audio = createdAudio
        audioRef.current = createdAudio
        setVoicePosition({ current: 0, duration: 0 })
        const knownDuration = recordedFile ? duration : recording?.durationSeconds ?? 0
        createdAudio.ontimeupdate = () => setVoicePosition({
          current: Number.isFinite(createdAudio.currentTime) ? createdAudio.currentTime : 0,
          duration: normalizeDuration(createdAudio.duration, knownDuration),
        })
        createdAudio.onloadedmetadata = createdAudio.ontimeupdate
        createdAudio.onended = () => {
          setPlaying(false)
          setVoicePosition((current) => ({ ...current, current: current.duration }))
        }
      }
      if (request !== voiceRequestRef.current) return
      if (audio.ended) {
        moveAudioTo(audio, 0)
        setVoicePosition((current) => ({ ...current, current: 0 }))
      }
      announcePlayback(playbackOwnerRef.current)
      await audio.play()
      setPlaying(true)
    } catch {
      setRecorderError('Не удалось воспроизвести запись.')
    }
  }

  const loadMusic = useCallback(async (file: NonNullable<typeof musicQuery.data>[number]) => {
    if (musicAudioRef.current) return musicAudioRef.current
    const request = musicRequestRef.current
    const blob = await getMusicBlob(file)
    if (request !== musicRequestRef.current) return null
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.volume = draft.musicVolume / 100
    audio.onloadedmetadata = () => {
      const nextDuration = normalizeDuration(audio.duration)
      setMusicDuration(nextDuration)
      if (nextDuration) {
        audio.currentTime = Math.min(draft.musicStartSeconds, Math.max(0, Math.floor(nextDuration - 0.1)))
      }
    }
    audio.onended = () => setMusicPlayingId(null)
    musicUrlRef.current = url
    musicAudioRef.current = audio
    return audio
  }, [draft.musicStartSeconds, draft.musicVolume])

  useEffect(() => {
    const file = musicQuery.data?.find((item) => item.id === draft.musicId)
    if (!file) return
    void loadMusic(file).catch(() => setMusicError('Не удалось определить длительность выбранной музыки.'))
  }, [draft.musicId, loadMusic, musicQuery.data])

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) uploadMutation.mutate({ file, mode: 'append' })
    event.target.value = ''
  }

  function selectMusicFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) musicUploadMutation.mutate(file)
    event.target.value = ''
  }

  async function toggleMusic() {
    const file = musicQuery.data?.find((item) => item.id === draft.musicId)
    if (!file) return
    if (musicPlaying) {
      musicAudioRef.current?.pause()
      setMusicPlayingId(null)
      return
    }
    setMusicError(null)
    const request = musicRequestRef.current
    try {
      audioRef.current?.pause()
      setPlaying(false)
      const audio = await loadMusic(file)
      if (!audio) return
      announcePlayback(playbackOwnerRef.current)
      await audio.play()
      if (request === musicRequestRef.current) setMusicPlayingId(file.id)
    } catch {
      setMusicError('Не удалось воспроизвести выбранную музыку.')
    }
  }

  const latestRecording = voiceQuery.data?.find((item) => item.id === draft.voiceRecordingId)
  const shownDuration = recordedFile ? duration : latestRecording?.durationSeconds ?? 0

  function seekVoice(progress: number) {
    const audio = audioRef.current
    const playbackDuration = voicePosition.duration || shownDuration
    if (!audio || !playbackDuration) return
    const next = Math.min(playbackDuration, Math.max(0, playbackDuration * progress))
    moveAudioTo(audio, next)
    setVoicePosition({ current: next, duration: playbackDuration })
  }

  return (
    <>
    <section className="min-w-0 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Аудио визитки</h2>{isRecording ? <span className="flex items-center gap-2 text-xs text-destructive"><span className="size-2 animate-pulse rounded-full bg-destructive" />Идёт запись · {formatDuration(duration)}</span> : null}</div>
      <p className="mt-1 text-xs text-muted-foreground">Новые голосовые фрагменты добавляются в конец текущей записи.</p>
      <div className="mt-3 flex flex-wrap gap-0">
        <Button className="rounded-r-none" onClick={async () => { if (await startRecording()) setDialogStage('recording') }} type="button" variant="outline"><Mic className="size-4 text-primary" />Записать</Button>
        <input accept=".webm,.mp3,.wav,.ogg,.m4a,.aac,audio/webm,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac" className="hidden" onChange={selectFile} ref={inputRef} type="file" />
        <Button className="rounded-l-none border-l-0" disabled={isRecording || uploadMutation.isPending} onClick={() => inputRef.current?.click()} type="button" variant="outline"><Upload className="size-4" />Добавить файл</Button>
        {recordedFile ? <Button className="ml-2" disabled={uploadMutation.isPending} onClick={() => uploadMutation.mutate({ file: recordedFile, mode: 'append' })} type="button"><CloudUpload className="size-4" />{uploadMutation.isPending ? 'Объединяем…' : 'Добавить фрагмент'}</Button> : null}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
        <button aria-label={playing ? 'Пауза' : 'Воспроизвести'} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-primary disabled:opacity-40" disabled={!recordedFile && !latestRecording} onClick={() => void togglePlayback(latestRecording)} type="button">{playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}</button>
        <div className="min-w-0 flex-1"><AudioWaveform className="h-8" onSeek={voicePosition.duration ? seekVoice : undefined} progress={voicePosition.duration ? voicePosition.current / voicePosition.duration : 0} /></div>
        <span className="text-[11px] tabular-nums text-muted-foreground">{formatDuration(voicePosition.current)} / {formatDuration(voicePosition.duration || shownDuration)}</span>
        <button aria-label="Обрезать голос" className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40" disabled={!latestRecording || uploadMutation.isPending || trimMutation.isPending} onClick={() => { setTrimStart(0); setTrimEnd(latestRecording?.durationSeconds ?? 0); setTrimOpen((open) => !open) }} type="button"><Scissors className="size-4" /></button>
      </div>

      {trimOpen && latestRecording ? (
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">Обрезать голос</p><span className="text-xs tabular-nums text-muted-foreground">{formatDuration(trimStart)}–{formatDuration(trimEnd)}</span></div>
          <label className="mt-3 grid grid-cols-[58px_minmax(0,1fr)] items-center gap-3 text-xs"><span>Начало</span><input aria-label="Начало фрагмента" max={Math.max(0, trimEnd - 1)} min={0} onChange={(event) => setTrimStart(clampTrimStart(Number(event.target.value), trimEnd))} step={1} type="range" value={clampTrimStart(trimStart, trimEnd)} /></label>
          <label className="mt-3 grid grid-cols-[58px_minmax(0,1fr)] items-center gap-3 text-xs"><span>Конец</span><input aria-label="Конец фрагмента" max={latestRecording.durationSeconds} min={Math.min(latestRecording.durationSeconds, trimStart + 1)} onChange={(event) => setTrimEnd(clampTrimEnd(Number(event.target.value), trimStart, latestRecording.durationSeconds))} step={1} type="range" value={clampTrimEnd(trimEnd, trimStart, latestRecording.durationSeconds)} /></label>
          <div className="mt-3 flex justify-end gap-2"><Button onClick={() => setTrimOpen(false)} size="sm" type="button" variant="outline">Отмена</Button><Button disabled={trimMutation.isPending || trimEnd <= trimStart} onClick={() => trimMutation.mutate(latestRecording)} size="sm" type="button">{trimMutation.isPending ? 'Обрезаем…' : 'Применить'}</Button></div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <span className="text-primary">♪</span><label className="text-xs" htmlFor="card-background-music">Фоновая музыка</label>
        <select className="h-9 min-w-36 max-w-48 rounded-lg border border-border bg-card px-3 text-xs outline-none" id="card-background-music" onChange={(event) => { setMusicPlayingId(null); setMusicDuration(0); onChange({ ...draft, musicId: event.target.value || null, musicStartSeconds: 0 }) }} value={draft.musicId ?? ''}>
          <option value="">Без музыки</option>
          {systemMusic.length ? <optgroup label="Базовая музыка">{systemMusic.map((file) => <option key={file.id} value={file.id}>{musicDisplayName(file.originalFilename)}</option>)}</optgroup> : null}
          {userMusic.length ? <optgroup label="Моя музыка">{userMusic.map((file) => <option key={file.id} value={file.id}>{musicDisplayName(file.originalFilename)}</option>)}</optgroup> : null}
        </select>
        <input accept=".mp3,.wav,.ogg,.m4a,.aac,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac" className="hidden" onChange={selectMusicFile} ref={musicInputRef} type="file" />
        <button className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs hover:bg-muted disabled:opacity-50" disabled={musicUploadMutation.isPending} onClick={() => musicInputRef.current?.click()} type="button"><Upload className="size-3.5" />{musicUploadMutation.isPending ? 'Загрузка…' : draft.musicId ? 'Заменить своей' : 'Загрузить свою'}</button>
        <button aria-label={musicPlaying ? 'Приостановить музыку' : 'Прослушать музыку'} className="flex size-8 items-center justify-center rounded-full border border-border text-primary disabled:opacity-40" disabled={!draft.musicId} onClick={() => void toggleMusic()} type="button">{musicPlaying ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}</button>
      </div>
      {draft.musicId && musicDuration ? <label className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 text-xs"><span>Начало музыки</span><input aria-label="Позиция начала фоновой музыки" max={Math.max(0, Math.floor(musicDuration - 0.1))} min={0} onChange={(event) => onChange((current) => ({ ...current, musicStartSeconds: Number(event.target.value) }))} step={1} type="range" value={Math.min(draft.musicStartSeconds, Math.max(0, Math.floor(musicDuration - 0.1)))} /><span className="w-20 text-right tabular-nums text-muted-foreground">{formatDuration(Math.min(draft.musicStartSeconds, musicDuration))} / {formatDuration(musicDuration)}</span></label> : null}
      {draft.musicId && !musicDuration && !musicError ? <p className="mt-3 text-xs text-muted-foreground">Определяем длительность музыки…</p> : null}
      {musicQuery.isError || musicError || musicUploadMutation.isError ? <p className="mt-2 text-xs text-destructive">{musicError ?? (musicUploadMutation.isError ? 'Не удалось загрузить музыку. Поддерживаются MP3, WAV, OGG, M4A и AAC.' : 'Не удалось загрузить список музыки.')}</p> : null}

      {recorderError || uploadMutation.isError || trimMutation.isError || voiceQuery.isError ? <p className="mt-3 text-xs text-destructive">{recorderError ?? (uploadMutation.error instanceof Error ? uploadMutation.error.message : trimMutation.error instanceof Error ? trimMutation.error.message : 'Не удалось сохранить или загрузить запись.')}</p> : null}
      {latestRecording?.processingStatus === 'READY' && !recordedFile ? <p className="mt-3 text-xs text-muted-foreground">Запись сохранена и готова к последующей обработке моделью.</p> : null}
    </section>
    <Modal className="max-w-md px-8 pb-8 pt-7" onClose={cancelRecording} open={dialogStage === 'recording'} title="Идёт запись">
      <BrandLogo className="mx-auto flex justify-center" imageClassName="w-60" />
      <div className="mt-12 text-center">
        <h2 className="text-3xl font-semibold">Идёт запись...</h2>
        <div aria-hidden="true" className="mt-10 flex h-20 items-end justify-center gap-2">
          {[32, 60, 80, 50, 68, 78, 40].map((height, index) => <span className="w-3 animate-pulse bg-border" key={`${height}-${index}`} style={{ animationDelay: `${index * 90}ms`, height }} />)}
        </div>
        <p className="mt-4 text-4xl font-semibold tabular-nums">{formatDuration(duration)}</p>
      </div>
      <Button className="mt-12 h-12 w-full text-base" onClick={stopRecording} type="button"><Square className="size-4 fill-current" />Остановить запись</Button>
    </Modal>
    <Modal className="max-w-md px-8 pb-8 pt-7" onClose={() => setDialogStage(null)} open={dialogStage === 'review'} title="Сообщение записано">
      <BrandLogo className="mx-auto flex justify-center" imageClassName="w-60" />
      <h2 className="mt-12 text-center text-3xl font-semibold">Сообщение записано!</h2>
      <div className="mt-8 flex items-center gap-3">
        <button aria-label={playing ? 'Пауза' : 'Прослушать запись'} className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-border text-primary" onClick={() => void togglePlayback()} type="button">{playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}</button>
        <div className="min-w-0 flex-1"><AudioWaveform className="h-12" onSeek={voicePosition.duration ? seekVoice : undefined} progress={voicePosition.duration ? voicePosition.current / voicePosition.duration : 0} /><p className="text-[11px] text-muted-foreground">{formatDuration(voicePosition.current)} / {formatDuration(voicePosition.duration || duration)}</p></div>
      </div>
      <Button className="mt-12 h-12 w-full" disabled={uploadMutation.isPending} onClick={() => void recordAgain()} type="button" variant="outline">Перезаписать</Button>
      <Button className="mt-2 h-12 w-full text-base" disabled={!recordedFile || uploadMutation.isPending} onClick={() => recordedFile && uploadMutation.mutate({ file: recordedFile, mode: 'append' })} type="button">{uploadMutation.isPending ? 'Объединяем…' : 'Добавить в визитку'}</Button>
      {uploadMutation.isError ? <p className="mt-3 text-center text-xs text-destructive">Не удалось сохранить запись.</p> : null}
    </Modal>
    </>
  )
}
