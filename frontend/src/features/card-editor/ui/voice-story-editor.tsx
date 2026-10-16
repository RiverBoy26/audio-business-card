import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CloudUpload, GripVertical, Mic, Pause, Play, Scissors, Square, Upload, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'

import type { CardDraft } from '@/entities/audio-card/model/types'
import { getMusicBlob, getMusicFiles, uploadMusic } from '@/entities/music/api/music-api'
import { getVoiceRecordingBlob, getVoiceRecordings, uploadVoiceRecording, type VoiceRecording } from '@/entities/voice-recording/api/voice-recording-api'
import { AudioWaveform } from '@/shared/ui/audio-waveform'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

type VoiceStoryEditorProps = { draft: CardDraft; onChange: Dispatch<SetStateAction<CardDraft>> }

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function extensionForMime(mimeType: string) {
  if (mimeType.includes('ogg')) return 'ogg'
  if (mimeType.includes('wav')) return 'wav'
  return 'webm'
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
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recordedFile, setRecordedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [musicPlayingId, setMusicPlayingId] = useState<string | null>(null)
  const [musicError, setMusicError] = useState<string | null>(null)
  const [dialogStage, setDialogStage] = useState<'recording' | 'review' | null>(null)
  const [recorderError, setRecorderError] = useState<string | null>(null)
  const voiceQuery = useQuery({ queryKey: ['voice-recordings'], queryFn: getVoiceRecordings })
  const musicQuery = useQuery({ queryKey: ['music'], queryFn: getMusicFiles })
  const musicPlaying = Boolean(draft.musicId && musicPlayingId === draft.musicId)
  const musicUploadMutation = useMutation({
    mutationFn: uploadMusic,
    onSuccess: async (file) => {
      onChange((current) => ({ ...current, musicId: file.id }))
      await queryClient.invalidateQueries({ queryKey: ['music'] })
    },
  })
  const uploadMutation = useMutation({
    mutationFn: ({ file, seconds }: { file: File; seconds: number }) => uploadVoiceRecording(file, seconds),
    onSuccess: async (recording) => {
      onChange((current) => ({ ...current, voiceRecordingId: recording.id }))
      setRecordedFile(null)
      setDuration(0)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setDialogStage(null)
      await queryClient.invalidateQueries({ queryKey: ['voice-recordings'] })
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

  async function startRecording() {
    setRecorderError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecorderError('Браузер не поддерживает запись с микрофона.')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
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
      audioRef.current?.pause()
      setPlaying(false)
      return
    }
    try {
      let source = previewUrl
      if (!source && recording) {
        if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current)
        source = URL.createObjectURL(await getVoiceRecordingBlob(recording))
        playbackUrlRef.current = source
      }
      if (!source) return
      const audio = new Audio(source)
      audioRef.current = audio
      audio.addEventListener('ended', () => setPlaying(false), { once: true })
      await audio.play()
      setPlaying(true)
    } catch {
      setRecorderError('Не удалось воспроизвести запись.')
    }
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) uploadMutation.mutate({ file, seconds: 0 })
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
      if (!musicAudioRef.current) {
        const blob = await getMusicBlob(file)
        if (request !== musicRequestRef.current) return
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.volume = draft.musicVolume / 100
        audio.onended = () => setMusicPlayingId(null)
        musicUrlRef.current = url
        musicAudioRef.current = audio
      }
      await musicAudioRef.current.play()
      if (request === musicRequestRef.current) setMusicPlayingId(file.id)
    } catch {
      setMusicError('Не удалось воспроизвести выбранную музыку.')
    }
  }

  const latestRecording = voiceQuery.data?.find((item) => item.id === draft.voiceRecordingId) ?? voiceQuery.data?.[0]
  const shownDuration = recordedFile ? duration : latestRecording?.durationSeconds ?? 0

  return (
    <>
    <section className="min-w-0 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Голосовая заметка</h2>{isRecording ? <span className="flex items-center gap-2 text-xs text-destructive"><span className="size-2 animate-pulse rounded-full bg-destructive" />Идёт запись · {formatDuration(duration)}</span> : null}</div>
      <div className="mt-3 flex flex-wrap gap-0">
        <Button className="rounded-r-none" onClick={async () => { if (await startRecording()) setDialogStage('recording') }} type="button" variant="outline"><Mic className="size-4 text-primary" />Записать</Button>
        <input accept=".webm,.mp3,.wav,.ogg,.m4a,.aac,audio/webm,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac" className="hidden" onChange={selectFile} ref={inputRef} type="file" />
        <Button className="rounded-l-none border-l-0" disabled={isRecording || uploadMutation.isPending} onClick={() => inputRef.current?.click()} type="button" variant="outline"><Upload className="size-4" />Загрузить</Button>
        {recordedFile ? <Button className="ml-2" disabled={uploadMutation.isPending} onClick={() => uploadMutation.mutate({ file: recordedFile, seconds: duration })} type="button"><CloudUpload className="size-4" />{uploadMutation.isPending ? 'Сохраняем…' : 'Сохранить запись'}</Button> : null}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <GripVertical className="size-4 shrink-0 text-muted-foreground" />
        <button aria-label={playing ? 'Пауза' : 'Воспроизвести'} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-primary disabled:opacity-40" disabled={!recordedFile && !latestRecording} onClick={() => void togglePlayback(latestRecording)} type="button">{playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}</button>
        <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium">{recordedFile?.name ?? latestRecording?.originalFilename ?? 'Рассказ о себе'}</p><AudioWaveform className="h-8" progress={recordedFile || latestRecording ? 0.72 : 0.18} /></div>
        <span className="text-[11px] text-muted-foreground">{formatDuration(shownDuration)}</span><Volume2 className="size-4 text-muted-foreground" /><span title="Редактор аудио будет добавлен позже"><Scissors className="size-4 text-muted-foreground" /></span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <span className="text-primary">♪</span><label className="text-xs" htmlFor="card-background-music">Фоновая музыка</label>
        <select className="h-9 min-w-36 max-w-48 rounded-lg border border-border bg-card px-3 text-xs outline-none" id="card-background-music" onChange={(event) => { setMusicPlayingId(null); onChange({ ...draft, musicId: event.target.value || null }) }} value={draft.musicId ?? ''}>
          <option value="">Без музыки</option>{musicQuery.data?.map((file) => <option key={file.id} value={file.id}>{file.originalFilename}</option>)}
        </select>
        <input accept=".mp3,.wav,.ogg,.m4a,.aac,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac" className="hidden" onChange={selectMusicFile} ref={musicInputRef} type="file" />
        <button className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs hover:bg-muted disabled:opacity-50" disabled={musicUploadMutation.isPending} onClick={() => musicInputRef.current?.click()} type="button"><Upload className="size-3.5" />{musicUploadMutation.isPending ? 'Загрузка…' : 'Добавить музыку'}</button>
        <button aria-label={musicPlaying ? 'Приостановить музыку' : 'Прослушать музыку'} className="flex size-8 items-center justify-center rounded-full border border-border text-primary disabled:opacity-40" disabled={!draft.musicId} onClick={() => void toggleMusic()} type="button">{musicPlaying ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}</button>
        <Volume2 className="ml-auto size-4 text-muted-foreground" /><input aria-label="Громкость музыки" className="w-24 sm:w-32" max={100} min={0} onChange={(event) => onChange({ ...draft, musicVolume: Number(event.target.value) })} type="range" value={draft.musicVolume} />
      </div>
      {musicQuery.isError || musicError || musicUploadMutation.isError ? <p className="mt-2 text-xs text-destructive">{musicError ?? (musicUploadMutation.isError ? 'Не удалось загрузить музыку. Поддерживаются MP3, WAV, OGG, M4A и AAC.' : 'Не удалось загрузить список музыки.')}</p> : null}

      {recorderError || uploadMutation.isError || voiceQuery.isError ? <p className="mt-3 text-xs text-destructive">{recorderError ?? 'Не удалось сохранить или загрузить запись.'}</p> : null}
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
        <div className="min-w-0 flex-1"><AudioWaveform className="h-12" progress={playing ? 0.72 : 0.58} /><p className="text-[11px] text-muted-foreground">0:00 / {formatDuration(duration)}</p></div>
      </div>
      <Button className="mt-12 h-12 w-full" disabled={uploadMutation.isPending} onClick={() => void recordAgain()} type="button" variant="outline">Перезаписать</Button>
      <Button className="mt-2 h-12 w-full text-base" disabled={!recordedFile || uploadMutation.isPending} onClick={() => recordedFile && uploadMutation.mutate({ file: recordedFile, seconds: duration })} type="button">{uploadMutation.isPending ? 'Добавляем…' : 'Добавить в визитку'}</Button>
      {uploadMutation.isError ? <p className="mt-3 text-center text-xs text-destructive">Не удалось сохранить запись.</p> : null}
    </Modal>
    </>
  )
}
