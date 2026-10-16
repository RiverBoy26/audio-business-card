import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/features/auth/model/use-auth'
import { AsyncState } from '@/shared/ui/async-state'

export function ProtectedRoute() {
  const { isReady, user } = useAuth()

  if (!isReady) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <AsyncState
          description="Проверяем сохранённую сессию."
          status="loading"
          title="Проверяем авторизацию"
        />
      </main>
    )
  }

  return user ? <Outlet /> : <Navigate replace to="/?login=1" />
}
