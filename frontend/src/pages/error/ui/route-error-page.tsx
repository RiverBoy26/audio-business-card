import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return error.status === 404
      ? 'Запрошенная страница не найдена.'
      : 'Не удалось открыть страницу.'
  }

  return 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'
}

export function RouteErrorPage() {
  const error = useRouteError()

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8">
      <section className="w-full max-w-md" aria-labelledby="error-title">
        <p className="text-sm font-medium text-destructive">Ошибка</p>
        <h1
          id="error-title"
          className="mt-2 text-2xl font-semibold tracking-tight"
        >
          Страница временно недоступна
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {getErrorMessage(error)}
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => window.location.reload()}>Повторить</Button>
          <Button asChild variant="outline">
            <Link to="/">На главную</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
