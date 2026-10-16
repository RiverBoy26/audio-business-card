import { useState, type FormEvent } from 'react'

import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Modal } from '@/shared/ui/modal'

export type AuthMode = 'login' | 'register'

type AuthDialogProps = {
  mode: AuthMode | null
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
}

export function AuthDialog({ mode, onClose, onModeChange }: AuthDialogProps) {
  const [submitted, setSubmitted] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
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
            <Field id="register-first-name" label="Имя" required />
            <Field id="register-last-name" label="Фамилия" required />
          </div>
        ) : null}
        {!isLogin ? (
          <Field id="register-phone" label="Номер телефона" required type="tel" />
        ) : null}
        <Field
          id={isLogin ? 'login-email' : 'register-email'}
          label={isLogin ? 'Логин' : 'Почта'}
          placeholder={isLogin ? 'Ваша почта' : undefined}
          required
          type="email"
        />
        <Field
          id={isLogin ? 'login-password' : 'register-password'}
          label="Пароль"
          placeholder={isLogin ? '••••••••' : undefined}
          required
          type="password"
        />
        {!isLogin ? (
          <Field id="register-password-repeat" label="Повторите пароль" required type="password" />
        ) : null}

        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="text-sm">
            {isLogin ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
            <button
              className="block text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setSubmitted(false)
                onModeChange(isLogin ? 'register' : 'login')
              }}
              type="button"
            >
              {isLogin ? 'Регистрация' : 'Войти'}
            </button>
          </p>
          <Button className="min-w-40" size="lg" type="submit">
            {isLogin ? 'Войти' : 'Регистрация'}
          </Button>
        </div>
        <p aria-live="polite" className="min-h-5 text-center text-xs text-primary">
          {submitted ? 'Форма готова к подключению API.' : null}
        </p>
      </form>
    </Modal>
  )
}
