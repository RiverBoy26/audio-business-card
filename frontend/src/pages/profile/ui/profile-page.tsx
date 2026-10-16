import { Camera, Mail, Phone } from 'lucide-react'

import { ProfileForm } from '@/features/profile-editor/ui/profile-form'
import { Button } from '@/shared/ui/button'

export function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          Личные данные
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Профиль
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Заполните профиль один раз, чтобы быстрее создавать визитки.
        </p>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
          <div className="relative mx-auto flex size-28 items-center justify-center rounded-xl bg-accent text-3xl font-semibold text-primary">
            МС
            <Button
              aria-label="Изменить фотографию"
              className="absolute -bottom-3 -right-3 rounded-full border-4 border-card"
              size="icon"
            >
              <Camera aria-hidden="true" className="size-4" />
            </Button>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-lg font-semibold">Марк Сергеевич Соколов</h2>
          </div>

          <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <Mail aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <dd className="truncate text-muted-foreground">
                mark.sokolov@example.ru
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <dd className="text-muted-foreground">+7 900 123-45-67</dd>
            </div>
          </dl>

        </aside>

        <ProfileForm />
      </div>
    </main>
  )
}
