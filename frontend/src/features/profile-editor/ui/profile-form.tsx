import type { CurrentUser } from '@/features/auth/model/auth-api'
import { Field } from '@/shared/ui/field'

type ProfileFormProps = { user: CurrentUser }

export function ProfileForm({ user }: ProfileFormProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-xl font-semibold">Основные данные</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Данные получены из защищённого endpoint <code>/me</code>. Изменение
          профиля текущим backend не поддерживается.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field disabled id="first-name" label="Имя" value={user.firstName} />
        <Field disabled id="middle-name" label="Отчество" value={user.middleName ?? ''} />
        <Field disabled id="last-name" label="Фамилия" value={user.lastName} />
        <Field disabled id="birth-date" label="Дата рождения" type="date" value={user.birthDate} />
        <Field disabled id="email" label="Электронная почта" type="email" value={user.email} />
        <Field disabled id="phone" label="Телефон" value={user.phone} />
      </div>
    </section>
  )
}
