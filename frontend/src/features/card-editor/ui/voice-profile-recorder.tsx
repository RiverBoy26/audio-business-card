import { useMutation } from '@tanstack/react-query'
import { Mic, RotateCcw, Square, WandSparkles } from 'lucide-react'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import type { CardDraft } from '@/entities/audio-card/model/types'
import { processVoiceProfile, type VoiceProfile } from '@/entities/voice-profile/api/voice-profile-api'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

type RecorderSession = {
  context: AudioContext
  processor: ScriptProcessorNode
  source: MediaStreamAudioSourceNode
  stream: MediaStream
}

type VoiceProfileRecorderProps = {
  onChange: Dispatch<SetStateAction<CardDraft>>
}

function encodeWav(chunks: Float32Array[], sampleRate: number) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const buffer = new ArrayBuffer(44 + length * 2)
  const view = new DataView(buffer)
  const write = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index))
  }
  write(0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, length * 2, true)
  let offset = 44
  for (const chunk of chunks) {
    for (const sample of chunk) {
      const normalized = Math.max(-1, Math.min(1, sample))
      view.setInt16(offset, normalized < 0 ? normalized * 0x8000 : normalized * 0x7fff, true)
      offset += 2
    }
  }
  return new Blob([buffer], { type: 'audio/wav' })
}

function experienceYears(profile: VoiceProfile) {
  if (!profile.experience) return null
  const months = (profile.experience.minMonths + profile.experience.maxMonths) / 2
  if (months === 0) return 0
  return Math.min(80, Math.max(1, Math.round(months / 12)))
}

export function VoiceProfileRecorder({ onChange }: VoiceProfileRecorderProps) {
  const sessionRef = useRef<RecorderSession | null>(null)
  const chunksRef = useRef<Float32Array[]>([])
  const sampleRateRef = useRef(48000)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<VoiceProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [instructionOpen, setInstructionOpen] = useState(false)
  const mutation = useMutation({
    mutationFn: processVoiceProfile,
    onSuccess: (profile) => {
      const years = experienceYears(profile)
      onChange((current) => ({
        ...current,
        description: profile.specialization ?? current.description,
        experienceYears: years ?? current.experienceYears,
        skills: profile.skills.length ? profile.skills : current.skills,
        title: profile.desiredPosition ?? current.title,
      }))
      setResult(profile)
    },
  })

  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recording])

  useEffect(() => {
    if (recording && seconds >= 120) void stopRecording()
  }, [recording, seconds])

  useEffect(() => () => {
    const session = sessionRef.current
    session?.processor.disconnect()
    session?.source.disconnect()
    session?.stream.getTracks().forEach((track) => track.stop())
    void session?.context.close()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  async function startRecording() {
    setError(null)
    setResult(null)
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      setError('Браузер не поддерживает запись с микрофона.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      const context = new AudioContext()
      const source = context.createMediaStreamSource(stream)
      const processor = context.createScriptProcessor(4096, 1, 1)
      chunksRef.current = []
      sampleRateRef.current = context.sampleRate
      processor.onaudioprocess = (event) => chunksRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)))
      source.connect(processor)
      processor.connect(context.destination)
      sessionRef.current = { context, processor, source, stream }
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setFile(null)
      setSeconds(0)
      setRecording(true)
    } catch (cause) {
      setError(cause instanceof DOMException && cause.name === 'NotAllowedError'
        ? 'Разрешите доступ к микрофону в настройках браузера.'
        : 'Не удалось начать запись.')
    }
  }

  async function stopRecording() {
    const session = sessionRef.current
    if (!session) return
    sessionRef.current = null
    session.processor.disconnect()
    session.source.disconnect()
    session.stream.getTracks().forEach((track) => track.stop())
    await session.context.close()
    const blob = encodeWav(chunksRef.current, sampleRateRef.current)
    const recordingFile = new File([blob], `profile-${Date.now()}.wav`, { type: 'audio/wav' })
    setFile(recordingFile)
    setPreviewUrl(URL.createObjectURL(blob))
    setRecording(false)
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setFile(null)
    setResult(null)
    setSeconds(0)
    setError(null)
  }

  return (
    <>
      <div className="mt-3 rounded-lg bg-muted p-3">
        <p className="text-xs text-muted-foreground">Запишите короткий текст, и мы заполним специальность, технологии, опыт и желаемую должность или роль.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!recording && !file ? <Button onClick={() => setInstructionOpen(true)} size="sm" type="button"><Mic className="size-4" />Начать запись</Button> : null}
          {recording ? <Button onClick={() => void stopRecording()} size="sm" type="button"><Square className="size-4 fill-current" />Остановить · {seconds} с</Button> : null}
          {file ? <Button disabled={mutation.isPending} onClick={() => mutation.mutate(file)} size="sm" type="button"><WandSparkles className="size-4" />{mutation.isPending ? 'Распознаём…' : 'Распознать и заполнить'}</Button> : null}
          {file ? <Button disabled={mutation.isPending} onClick={reset} size="sm" type="button" variant="outline"><RotateCcw className="size-4" />Перезаписать</Button> : null}
        </div>
        {previewUrl ? <audio className="mt-3 h-9 w-full" controls src={previewUrl} /> : null}
        {result ? <div className="mt-3 rounded-md border border-border bg-card p-3 text-xs"><p className="font-medium text-primary">Поля заполнены по записи</p><p className="mt-1 text-muted-foreground">Распознано: {result.transcript}</p>{result.unknownSkills.length ? <p className="mt-1 text-destructive">Не распознаны технологии: {result.unknownSkills.join(', ')}</p> : null}{result.issues.length ? <p className="mt-1 text-amber-700">Проверьте результат вручную: {result.issues.join(', ')}</p> : null}</div> : null}
        {error || mutation.isError ? <p className="mt-2 text-xs text-destructive">{error ?? (mutation.error instanceof Error ? mutation.error.message : 'Не удалось обработать запись.')}</p> : null}
      </div>

      <Modal className="max-w-xl px-6 pb-7 pt-6 sm:px-8" onClose={() => setInstructionOpen(false)} open={instructionOpen} title="Как продиктовать данные">
        <BrandLogo className="mb-7" imageClassName="w-52 sm:w-60" />
        <h2 className="text-2xl font-semibold">Как продиктовать данные</h2>
        <div className="mt-6 grid gap-5 text-sm leading-6">
          <div>
            <p className="font-semibold">Шаблон</p>
            <p className="mt-2 border-l-[3px] border-primary pl-4 text-muted-foreground">
              Я [специальность]. Работаю с [технологии]. Мой опыт — [срок]. Хочу работать [желаемая должность или роль].
            </p>
          </div>
          <div>
            <p className="font-semibold">Пример</p>
            <p className="mt-2 border-l-[3px] border-border pl-4 text-muted-foreground">
              Я бэкенд-разработчик. Работаю с Java, Spring Boot, PostgreSQL и Docker. Мой опыт — два года. Хочу работать Middle Java-разработчиком.
            </p>
          </div>
        </div>
        <Button className="mt-7 h-11 w-full" onClick={() => { setInstructionOpen(false); void startRecording() }} type="button">Начать запись</Button>
      </Modal>
    </>
  )
}
