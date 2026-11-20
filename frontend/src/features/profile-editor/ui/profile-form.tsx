import { CheckCircle2, LoaderCircle, Pencil } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'

import type {
  CurrentUser,
  UpdateProfilePayload,
} from '@/features/auth/model/auth-api'
import { ApiError } from '@/shared/api/api-client'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'

type ProfileFormProps = {
  onSave: (payload: UpdateProfilePayload) => Promise<void>
  user: CurrentUser
}

type ProfileDraft = Omit<UpdateProfilePayload, 'middleName'> & {
  middleName: string
}

const maxBirthDate = new Date().toISOString().slice(0, 10)

function createDraft(user: CurrentUser): ProfileDraft {
  return {
    birthDate: user.birthDate,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName ?? '',
    phone: user.phone,
  }
}

function draftsMatch(draft: ProfileDraft, user: CurrentUser) {
  return (
    draft.birthDate === user.birthDate &&
    draft.email === user.email &&
    draft.firstName === user.firstName &&
    draft.lastName === user.lastName &&
    draft.middleName === (user.middleName ?? '') &&
    draft.phone === user.phone
  )
}

export function ProfileForm({ onSave, user }: ProfileFormProps) {
  const [draft, setDraft] = useState(() => createDraft(user))
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const isDirty = !draftsMatch(draft, user)

  function update(field: keyof ProfileDraft) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setDraft((current) => ({ ...current, [field]: event.target.value }))
      setFieldErrors((current) => {
        if (!current[field]) return current
        const next = { ...current }
        delete next[field]
        return next
      })
      setError(null)
      setSaved(false)
    }
  }

  function startEditing() {
    setDraft(createDraft(user))
    setError(null)
    setFieldErrors({})
    setSaved(false)
    setEditing(true)
  }

  function cancelEditing() {
    setDraft(createDraft(user))
    setError(null)
    setFieldErrors({})
    setEditing(false)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isDirty || saving) return

    setSaving(true)
    setError(null)
    setFieldErrors({})
    setSaved(false)

    try {
      const payload: UpdateProfilePayload = {
        ...draft,
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        middleName: draft.middleName.trim() || null,
        email: draft.email.trim(),
        phone: draft.phone.trim(),
      }
      await onSave(payload)
      setDraft({ ...payload, middleName: payload.middleName ?? '' })
      setEditing(false)
      setSaved(true)
    } catch (caught) {
      const nextFieldErrors = caught instanceof ApiError ? caught.fieldErrors : {}
      setFieldErrors(nextFieldErrors)
      setError(Object.keys(nextFieldErrors).length === 0
        ? caught instanceof Error
          ? caught.message
          : 'Не удалось сохранить изменения'
        : null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Основные данные</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Эти данные будут использоваться при создании новых визиток.
          </p>
        </div>
        {!editing ? (
          <Button onClick={startEditing} size="sm" type="button" variant="outline">
            <Pencil aria-hidden="true" className="size-4" />
            Редактировать
          </Button>
        ) : null}
      </div>

      <form className="mt-5" onSubmit={submit}>
        <fieldset disabled={!editing || saving}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field autoComplete="given-name" error={fieldErrors.firstName} id="first-name" label="Имя" maxLength={100} onChange={update('firstName')} required value={draft.firstName} />
            <Field autoComplete="additional-name" error={fieldErrors.middleName} id="middle-name" label="Отчество" maxLength={100} onChange={update('middleName')} value={draft.middleName} />
            <Field autoComplete="family-name" error={fieldErrors.lastName} id="last-name" label="Фамилия" maxLength={100} onChange={update('lastName')} required value={draft.lastName} />
            <Field autoComplete="bday" error={fieldErrors.birthDate} id="birth-date" label="Дата рождения" max={maxBirthDate} onChange={update('birthDate')} required type="date" value={draft.birthDate} />
            <Field autoComplete="email" error={fieldErrors.email} id="email" label="Электронная почта" maxLength={255} onChange={update('email')} required type="email" value={draft.email} />
            <Field autoComplete="tel" error={fieldErrors.phone} id="phone" label="Телефон" onChange={update('phone')} pattern="^\+[0-9]{10,11}$" required title="Введите номер в формате +79991234567" value={draft.phone} />
          </div>
        </fieldset>

        <div aria-live="polite" className="mt-4 min-h-5 text-sm">
          {error ? <p className="text-destructive">{error}</p> : null}
          {saved ? (
            <p className="flex items-center gap-2 text-foreground">
              <CheckCircle2 aria-hidden="true" className="size-4 text-primary" />
              Изменения сохранены
            </p>
          ) : null}
        </div>

        {editing ? (
          <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button disabled={saving} onClick={cancelEditing} type="button" variant="outline">Отменить</Button>
            <Button disabled={!isDirty || saving} type="submit">
              {saving ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
              {saving ? 'Сохраняем…' : 'Сохранить изменения'}
            </Button>
          </div>
        ) : null}
      </form>
    </section>
  )
}
