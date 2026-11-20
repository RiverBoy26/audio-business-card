import { useState, type FormEvent } from 'react'

import { useAuth } from '@/features/auth/model/use-auth'
import { ApiError } from '@/shared/api/api-client'
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    setError(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      if (mode === 'login') {
        await login(String(form.get('email')), String(form.get('password')))
      } else {
        const password = String(form.get('password'))
        const passwordRepeat = String(form.get('passwordRepeat'))

        if (password !== passwordRepeat) {
          setFieldErrors({ passwordRepeat: 'Пароли не совпадают' })
          return
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
          personalDataConsent: form.get('personalDataConsent') === 'on',
        })
      }
      onClose()
    } catch (caught) {
      const nextFieldErrors = caught instanceof ApiError ? caught.fieldErrors : {}
      setFieldErrors(nextFieldErrors)
      setError(Object.keys(nextFieldErrors).length === 0
        ? caught instanceof Error
          ? caught.message
          : isLogin
            ? 'Не удалось войти'
            : 'Не удалось зарегистрироваться'
        : null)
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
      <BrandLogo className="mx-auto w-fit" imageClassName="text-2xl sm:text-3xl" />
      <h2 className="mt-10 text-center text-3xl font-bold">
        {isLogin ? 'С возвращением!' : 'Регистрация'}
      </h2>

      <form className="mt-8 grid gap-4" onSubmit={submit}>
        {!isLogin ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={fieldErrors.firstName} id="register-first-name" label="Имя" name="firstName" onChange={() => clearFieldError('firstName')} required />
            <Field error={fieldErrors.lastName} id="register-last-name" label="Фамилия" name="lastName" onChange={() => clearFieldError('lastName')} required />
          </div>
        ) : null}
        {!isLogin ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={fieldErrors.middleName} id="register-middle-name" label="Отчество" name="middleName" onChange={() => clearFieldError('middleName')} />
            <Field
              error={fieldErrors.birthDate}
              id="register-birth-date"
              label="Дата рождения"
              max={maxBirthDate}
              name="birthDate"
              onChange={() => clearFieldError('birthDate')}
              required
              type="date"
            />
          </div>
        ) : null}
        {!isLogin ? (
          <Field
            error={fieldErrors.phone}
            id="register-phone"
            label="Номер телефона"
            name="phone"
            onChange={() => clearFieldError('phone')}
            pattern="\+[0-9]{10,11}"
            placeholder="+79001234567"
            required
            title="Введите номер в формате +79991234567"
            type="tel"
          />
        ) : null}
        <Field
          error={fieldErrors.email}
          id={isLogin ? 'login-email' : 'register-email'}
          label={isLogin ? 'Логин' : 'Почта'}
          name="email"
          onChange={() => clearFieldError('email')}
          placeholder={isLogin ? 'Ваша почта' : undefined}
          required
          type="email"
        />
        <Field
          error={fieldErrors.password}
          id={isLogin ? 'login-password' : 'register-password'}
          label="Пароль"
          name="password"
          onChange={() => clearFieldError('password')}
          maxLength={72}
          minLength={isLogin ? undefined : 8}
          placeholder={isLogin ? '••••••••' : undefined}
          required
          type="password"
        />
        {!isLogin ? (
          <Field
            error={fieldErrors.passwordRepeat}
            id="register-password-repeat"
            label="Повторите пароль"
            maxLength={72}
            minLength={8}
            name="passwordRepeat"
            onChange={() => clearFieldError('passwordRepeat')}
            required
            type="password"
          />
        ) : null}
        {!isLogin ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/35 px-4 py-3 text-sm leading-5 transition hover:border-primary/35" htmlFor="register-personal-data-consent">
            <input
              aria-describedby={fieldErrors.personalDataConsent ? 'register-personal-data-consent-error' : undefined}
              aria-invalid={fieldErrors.personalDataConsent ? true : undefined}
              className="mt-0.5 size-4 shrink-0 accent-primary"
              id="register-personal-data-consent"
              name="personalDataConsent"
              onChange={() => clearFieldError('personalDataConsent')}
              required
              type="checkbox"
            />
            <span>
              Я даю согласие на обработку персональных данных
              {fieldErrors.personalDataConsent ? (
                <span className="mt-1 block text-xs text-destructive" id="register-personal-data-consent-error">
                  {fieldErrors.personalDataConsent}
                </span>
              ) : null}
            </span>
          </label>
        ) : null}

        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="text-sm">
            {isLogin ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
            <button
              className="block text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setError(null)
                setFieldErrors({})
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
