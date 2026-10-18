import { ImagePlus, Mic, Pencil, UserRound, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'

import type { CardDraft } from '@/entities/audio-card/model/types'
import { getStackSuggestions, type StackSuggestion } from '@/entities/stack/api/stack-api'
import { CardImage } from '@/entities/audio-card/ui/card-image'
import { Button } from '@/shared/ui/button'
import { Field, SelectField } from '@/shared/ui/field'
import { VoiceProfileRecorder } from '@/features/card-editor/ui/voice-profile-recorder'

type ProfileDataFormProps = {
  avatarUrl: string | null
  draft: CardDraft
  onChange: Dispatch<SetStateAction<CardDraft>>
}

type InputMode = 'manual' | 'voice'

export function ProfileDataForm({ avatarUrl, draft, onChange }: ProfileDataFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputMode, setInputMode] = useState<InputMode>('manual')
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [skillError, setSkillError] = useState<string | null>(null)
  const stackQuery = useQuery({ queryKey: ['stack-suggestions'], queryFn: getStackSuggestions })
  const normalizedSkill = newSkill.trim().toLocaleLowerCase('ru-RU')
  const suggestions = normalizedSkill
    ? (stackQuery.data ?? []).filter((item) => [item.name, ...item.aliases].some((value) => value.toLocaleLowerCase('ru-RU').includes(normalizedSkill))).slice(0, 6)
    : []
  const positionLabel = 'Желаемая роль в команде'
  const positionPlaceholder = 'Frontend-разработчик в продуктовой команде'

  useEffect(() => {
    const previewUrl = draft.photoFile ? draft.photoUrl : null
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [draft.photoFile, draft.photoUrl])

  function update<Key extends keyof CardDraft>(key: Key, value: CardDraft[Key]) {
    onChange({ ...draft, [key]: value })
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    onChange({ ...draft, photoFile: file, photoUrl: URL.createObjectURL(file) })
  }

  function addSkill(suggestion?: StackSuggestion) {
    const skill = (suggestion?.name ?? newSkill).trim().replace(/\s+/g, ' ')
    if (!skill) {
      setSkillError('Введите название технологии.')
      return
    }
    if (draft.skills.some((item) => item.toLocaleLowerCase() === skill.toLocaleLowerCase())) {
      setSkillError('Эта технология уже добавлена.')
      return
    }
    if (draft.skills.length >= 20) {
      setSkillError('Можно добавить не более 20 технологий.')
      return
    }
    update('skills', [...draft.skills, skill])
    setNewSkill('')
    setSkillError(null)
    setIsAddingSkill(false)
  }

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Данные визитки</h2>
          <p className="mt-1 text-xs text-muted-foreground">Выберите, как заполнить основную информацию.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-border">
        <button aria-pressed={inputMode === 'manual'} className={`flex h-10 items-center justify-center gap-2 border-r border-border text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${inputMode === 'manual' ? 'bg-accent text-primary' : 'hover:bg-muted'}`} onClick={() => setInputMode('manual')} type="button"><Pencil className="size-4" /> Вручную</button>
        <button aria-pressed={inputMode === 'voice'} className={`flex h-10 items-center justify-center gap-2 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${inputMode === 'voice' ? 'bg-accent text-primary' : 'hover:bg-muted'}`} onClick={() => setInputMode('voice')} type="button"><Mic className="size-4" /> Голосом</button>
      </div>

      {inputMode === 'voice' ? <VoiceProfileRecorder onChange={onChange} /> : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field disabled id="card-full-name" label="ФИО" placeholder="Заполните имя в профиле" value={draft.fullName} />
        <Field id="card-specialty" label="Специальность" maxLength={5000} onChange={(event) => update('description', event.target.value)} placeholder="Бэкенд-разработчик" value={draft.description} />
        <SelectField id="experience-years" label="Опыт работы" onChange={(event) => update('experienceYears', Number(event.target.value))} value={draft.experienceYears}>
          <option value={0}>Без опыта</option>
          {Array.from({ length: 10 }, (_, index) => index + 1).map((years) => <option key={years} value={years}>{years} {years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}</option>)}
        </SelectField>
        <Field id="desired-position" label={positionLabel} maxLength={150} onChange={(event) => update('title', event.target.value)} placeholder={positionPlaceholder} required value={draft.title} />
      </div>

      <fieldset className="mt-5 border-t border-border pt-4">
        <legend className="text-xs font-medium">Контакты в визитке</legend>
        <p className="mt-1 text-[11px] text-muted-foreground">Выберите, какие данные смогут увидеть получатели карточки.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className={`flex min-w-0 items-start gap-2 rounded-lg border border-border px-3 py-2.5 text-xs ${draft.contactEmail ? 'cursor-pointer hover:bg-muted/60' : 'opacity-55'}`}>
            <input checked={draft.showContactEmail && Boolean(draft.contactEmail)} className="mt-0.5 size-4 accent-primary" disabled={!draft.contactEmail} onChange={(event) => update('showContactEmail', event.target.checked)} type="checkbox" />
            <span className="min-w-0"><span className="block font-medium">Электронная почта</span><span className="mt-0.5 block truncate text-muted-foreground">{draft.contactEmail || 'Не указана в профиле'}</span></span>
          </label>
          <label className={`flex min-w-0 items-start gap-2 rounded-lg border border-border px-3 py-2.5 text-xs ${draft.contactPhone ? 'cursor-pointer hover:bg-muted/60' : 'opacity-55'}`}>
            <input checked={draft.showContactPhone && Boolean(draft.contactPhone)} className="mt-0.5 size-4 accent-primary" disabled={!draft.contactPhone} onChange={(event) => update('showContactPhone', event.target.checked)} type="checkbox" />
            <span className="min-w-0"><span className="block font-medium">Телефон</span><span className="mt-0.5 block truncate text-muted-foreground">{draft.contactPhone || 'Не указан в профиле'}</span></span>
          </label>
        </div>
      </fieldset>

      <div className="mt-5">
        <p className="text-xs font-medium">Стек</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {draft.skills.map((skill) => <span className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-xs" key={skill}>{skill}<button aria-label={`Убрать ${skill}`} className="text-muted-foreground hover:text-foreground" onClick={() => update('skills', draft.skills.filter((item) => item !== skill))} type="button"><X className="size-3" /></button></span>)}
          {isAddingSkill ? (
            <div className="relative">
              <form className="flex h-8 overflow-hidden rounded-lg border border-primary/50 bg-card" onSubmit={(event) => { event.preventDefault(); addSkill(suggestions[0]) }}>
                <input aria-autocomplete="list" aria-controls="stack-suggestions" aria-label="Новая технология" autoComplete="off" autoFocus className="w-40 px-2.5 text-xs outline-none" maxLength={50} onChange={(event) => { setNewSkill(event.target.value); setSkillError(null) }} onKeyDown={(event) => { if (event.key === 'Escape') { setIsAddingSkill(false); setNewSkill(''); setSkillError(null) } }} placeholder="Например, реакт" value={newSkill} />
                <button className="border-l border-border px-2 text-xs font-medium text-primary hover:bg-accent" type="submit">Добавить</button>
              </form>
              {suggestions.length ? <div className="absolute left-0 top-10 z-20 w-72 overflow-hidden rounded-lg border border-border bg-card shadow-lg" id="stack-suggestions" role="listbox">{suggestions.map((item) => <button className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs hover:bg-muted" key={item.id} onClick={() => addSkill(item)} role="option" type="button"><span className="font-medium">{item.name}</span>{item.aliases[0] ? <span className="truncate text-muted-foreground">{item.aliases[0]}</span> : null}</button>)}</div> : null}
            </div>
          ) : (
            <button className="rounded-lg border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary" onClick={() => setIsAddingSkill(true)} type="button">+ Добавить</button>
          )}
        </div>
        {skillError ? <p className="mt-2 text-xs text-destructive">{skillError}</p> : null}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          {draft.photoUrl ? <CardImage alt="Выбранное фото" className="size-12 rounded-lg bg-muted object-cover" src={draft.photoUrl} /> : <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">Фото</div>}
          <div><p className="text-xs font-medium">Фотография карточки</p><p className="mt-1 text-[11px] text-muted-foreground">JPG, PNG или WEBP, до 5 МБ.</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input accept="image/jpeg,image/png,image/webp" className="hidden" onChange={selectPhoto} ref={inputRef} type="file" />
          <Button onClick={() => inputRef.current?.click()} size="sm" type="button" variant="outline"><ImagePlus className="size-4" />Загрузить с устройства</Button>
          <Button disabled={!avatarUrl} onClick={() => avatarUrl && onChange({ ...draft, photoFile: null, photoUrl: avatarUrl })} size="sm" type="button" variant="outline"><UserRound className="size-4" />Взять аватар профиля</Button>
        </div>
      </div>
    </section>
  )
}
