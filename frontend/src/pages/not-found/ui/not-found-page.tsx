import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl items-center px-4 py-8 sm:px-6">
      <section aria-labelledby="not-found-title">
        <p className="text-sm font-medium text-muted-foreground">Ошибка 404</p>
        <h1
          id="not-found-title"
          className="mt-2 text-2xl font-semibold tracking-tight"
        >
          Страница не найдена
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Возможно, адрес изменился или был указан неверно.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">На главную</Link>
        </Button>
      </section>
    </main>
  )
}
