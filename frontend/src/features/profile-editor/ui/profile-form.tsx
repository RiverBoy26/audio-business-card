import { Check } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'

export function ProfileForm() {
  const [saved, setSaved] = useState(false)

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form className="grid gap-4" onSubmit={saveProfile}>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Основные данные</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              ФИО из профиля автоматически подставляется во все новые визитки.
            </p>
          </div>
          <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">Черновик</span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field defaultValue="Марк" id="first-name" label="Имя" required />
          <Field defaultValue="Сергеевич" id="patronymic" label="Отчество" />
          <Field defaultValue="Соколов" id="last-name" label="Фамилия" required />
          <Field defaultValue="1998-04-12" id="birth-date" label="Дата рождения" type="date" />
          <Field defaultValue="mark.sokolov@example.ru" id="email" label="Электронная почта" required type="email" />
          <Field defaultValue="+7 900 123-45-67" id="phone" label="Телефон" type="tel" />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <p aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
          {saved ? <span className="inline-flex items-center gap-1"><Check aria-hidden="true" className="size-4 text-primary" />Изменения сохранены</span> : null}
        </p>
        <Button type="submit">Сохранить изменения</Button>
      </div>
    </form>
  )
}
