import { useState, type FormEvent } from 'react'

import { useAuth } from '@/features/auth/model/use-auth'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Modal } from '@/shared/ui/modal'

export type AuthMode = 'login' | 'register'

const maxBirthDate = new Date().toISOString().slice(0, 10)

type AuthDialogProps = {
  mode: AuthMode | null
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
}

export function AuthDialog({ mode, onClose, onModeChange }: AuthDialogProps) {
  const { login, register } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError(null)

    try {
      if (mode === 'login') {
        await login(String(form.get('email')), String(form.get('password')))
      } else {
        const password = String(form.get('password'))
        const passwordRepeat = String(form.get('passwordRepeat'))

        if (password !== passwordRepeat) {
          throw new Error('Пароли не совпадают')
        }

        const middleName = String(form.get('middleName')).trim()
        await register({
          firstName: String(form.get('firstName')).trim(),
          lastName: String(form.get('lastName')).trim(),
          middleName: middleName || null,
          birthDate: String(form.get('birthDate')),
          email: String(form.get('email')).trim(),
          phone: String(form.get('phone')).trim(),
          password,
        })
      }
      onClose()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : isLogin
            ? 'Не удалось войти'
            : 'Не удалось зарегистрироваться',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <Modal
      className="max-w-[540px]"
      onClose={onClose}
      open={mode !== null}
      title={isLogin ? 'Вход' : 'Регистрация'}
    >
      <BrandLogo className="mx-auto w-fit" imageClassName="h-auto w-64 max-w-[80vw]" />
      <h2 className="mt-10 text-center text-3xl font-bold">
        {isLogin ? 'С возвращением!' : 'Регистрация'}
      </h2>

      <form className="mt-8 grid gap-4" onSubmit={submit}>
        {!isLogin ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="register-first-name" label="Имя" name="firstName" required />
            <Field id="register-last-name" label="Фамилия" name="lastName" required />
          </div>
        ) : null}
        {!isLogin ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="register-middle-name" label="Отчество" name="middleName" />
            <Field
              id="register-birth-date"
              label="Дата рождения"
              max={maxBirthDate}
              name="birthDate"
              required
              type="date"
            />
          </div>
        ) : null}
        {!isLogin ? (
          <Field
            id="register-phone"
            label="Номер телефона"
            name="phone"
            pattern="\+[0-9-]{9,11}[0-9]"
            placeholder="+79001234567"
            required
            title="Введите номер с плюсом, используя цифры и дефисы"
            type="tel"
          />
        ) : null}
        <Field
          id={isLogin ? 'login-email' : 'register-email'}
          label={isLogin ? 'Логин' : 'Почта'}
          name="email"
          placeholder={isLogin ? 'Ваша почта' : undefined}
          required
          type="email"
        />
        <Field
          id={isLogin ? 'login-password' : 'register-password'}
          label="Пароль"
          name="password"
          maxLength={72}
          minLength={isLogin ? undefined : 8}
          placeholder={isLogin ? '••••••••' : undefined}
          required
          type="password"
        />
        {!isLogin ? (
          <Field
            id="register-password-repeat"
            label="Повторите пароль"
            maxLength={72}
            minLength={8}
            name="passwordRepeat"
            required
            type="password"
          />
        ) : null}

        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="text-sm">
            {isLogin ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
            <button
              className="block text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setError(null)
                onModeChange(isLogin ? 'register' : 'login')
              }}
              type="button"
            >
              {isLogin ? 'Регистрация' : 'Войти'}
            </button>
          </p>
          <Button
            className="min-w-40"
            disabled={submitting}
            size="lg"
            type="submit"
          >
            {submitting
              ? isLogin
                ? 'Входим…'
                : 'Создаём аккаунт…'
              : isLogin
                ? 'Войти'
                : 'Зарегистрироваться'}
          </Button>
        </div>
        <p aria-live="polite" className="min-h-5 text-center text-xs text-destructive">
          {error}
        </p>
      </form>
    </Modal>
  )
}
