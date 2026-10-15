export function RouteLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Загрузка страницы"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </main>
  )
}
