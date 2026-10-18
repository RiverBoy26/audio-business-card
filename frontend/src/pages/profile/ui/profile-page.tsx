import { Camera, Mail, Phone } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'

import { UserAvatar } from '@/entities/user/ui/user-avatar'
import { useAuth } from '@/features/auth/model/use-auth'
import { ProfileForm } from '@/features/profile-editor/ui/profile-form'
import { Button } from '@/shared/ui/button'

const avatarTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxAvatarSize = 5 * 1024 * 1024

export function ProfilePage() {
  const { avatarRevision, updateProfile, uploadAvatar, user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (!user) return null

  const fullName = [user.lastName, user.firstName, user.middleName]
    .filter(Boolean)
    .join(' ')
  async function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!avatarTypes.has(file.type)) {
      setError('Выберите изображение JPG, PNG или WEBP')
      return
    }
    if (file.size > maxAvatarSize) {
      setError('Размер изображения не должен превышать 5 МБ')
      return
    }
    setUploading(true)
    setError(null)
    try {
      await uploadAvatar(file)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось загрузить аватар')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Профиль</h1>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
          <div className="relative mx-auto size-28">
            <UserAvatar
              alt={`Аватар пользователя ${fullName}`}
              avatarUrl={user.avatarUrl}
              className="size-full rounded-xl text-3xl"
              firstName={user.firstName}
              lastName={user.lastName}
              revision={avatarRevision}
            />
            <input accept="image/jpeg,image/png,image/webp" className="hidden" onChange={selectAvatar} ref={inputRef} type="file" />
            <Button aria-label="Загрузить аватар" className="absolute -bottom-3 -right-3 rounded-full border-4 border-card" disabled={uploading} onClick={() => inputRef.current?.click()} size="icon" type="button">
              <Camera className="size-4" />
            </Button>
          </div>
          <h2 className="mt-6 text-center text-lg font-semibold">{fullName}</h2>
          <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" />
              <dd className="truncate text-muted-foreground">{user.email}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              <dd className="text-muted-foreground">{user.phone}</dd>
            </div>
          </dl>
          {error ? <p className="mt-2 text-center text-xs text-destructive">{error}</p> : null}
        </aside>
        <ProfileForm onSave={updateProfile} user={user} />
      </div>
    </main>
  )
}
