import { Mic, Pencil, UserRound } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'

import type { CardDraft } from '@/entities/audio-card/model/types'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Field, SelectField } from '@/shared/ui/field'
import { Tag } from '@/shared/ui/tag'

type DataSource = 'profile' | 'manual' | 'voice'

type ProfileDataFormProps = {
  draft: CardDraft
  onChange: (draft: CardDraft) => void
}

const sourceOptions = [
  { icon: UserRound, id: 'profile' as const, label: 'Из профиля' },
  { icon: Pencil, id: 'manual' as const, label: 'Вручную' },
  { icon: Mic, id: 'voice' as const, label: 'Голосом' },
]

export function ProfileDataForm({ draft, onChange }: ProfileDataFormProps) {
  const [source, setSource] = useState<DataSource>('profile')
  const [skillInput, setSkillInput] = useState('')
  const disabled = source === 'profile'

  function updateField<Key extends keyof CardDraft>(
    key: Key,
    value: CardDraft[Key],
  ) {
    onChange({ ...draft, [key]: value })
  }

  function addSkill(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()

    const value = skillInput.trim()
    if (!value || draft.skills.includes(value)) return

    updateField('skills', [...draft.skills, value])
    setSkillInput('')
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Данные визитки</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Выберите, как заполнить основную информацию.
          </p>
        </div>
        {source === 'profile' ? (
          <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-primary">
            Синхронизировано
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-md border border-border">
        {sourceOptions.map((option) => {
          const Icon = option.icon
          const selected = option.id === source

          return (
            <button
              aria-pressed={selected}
              className={cn(
                'flex h-9 items-center justify-center gap-1.5 border-r border-border px-2 text-xs font-medium transition last:border-r-0 hover:bg-muted focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                selected && 'bg-accent text-primary',
              )}
              key={option.id}
              onClick={() => setSource(option.id)}
              type="button"
            >
              <Icon aria-hidden="true" className="size-3.5" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          )
        })}
      </div>

      {source === 'voice' ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-accent p-3">
          <Button size="sm">
            <Mic aria-hidden="true" className="size-4" />
            Записать данные
          </Button>
          <p className="text-xs text-muted-foreground">
            Эта запись не попадёт в визитку.
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          disabled={disabled}
          id="full-name"
          label="ФИО"
          onChange={(event) => updateField('fullName', event.target.value)}
          value={draft.fullName}
        />
        <Field
          disabled={disabled}
          id="specialty"
          label="Специальность"
          onChange={(event) => updateField('specialty', event.target.value)}
          value={draft.specialty}
        />
        <SelectField
          disabled={disabled}
          id="experience"
          label="Опыт"
          onChange={(event) => updateField('experience', event.target.value)}
          value={draft.experience}
        >
          <option>Без опыта</option>
          <option>До 1 года</option>
          <option>1 год</option>
          <option>2 года</option>
          <option>3 года и больше</option>
        </SelectField>
        <Field
          disabled={disabled}
          id="desired-role"
          label="Желаемая должность"
          onChange={(event) => updateField('desiredRole', event.target.value)}
          value={draft.desiredRole}
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium" htmlFor="skill-input">
          Стек
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {draft.skills.map((skill) => (
            <Tag
              key={skill}
              onRemove={
                disabled
                  ? undefined
                  : () =>
                      updateField(
                        'skills',
                        draft.skills.filter((item) => item !== skill),
                      )
              }
            >
              {skill}
            </Tag>
          ))}
          {disabled ? null : (
            <input
              className="h-7 min-w-24 flex-1 rounded-md border border-dashed border-border bg-card px-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              id="skill-input"
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={addSkill}
              placeholder="Навык + Enter"
              value={skillInput}
            />
          )}
        </div>
      </div>
    </section>
  )
}
