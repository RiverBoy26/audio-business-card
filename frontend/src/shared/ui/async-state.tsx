import { Button } from '@/shared/ui/button'

type AsyncStateProps = {
  description: string
  onRetry?: () => void
  status: 'loading' | 'empty' | 'error'
  title: string
}

export function AsyncState({
  description,
  onRetry,
  status,
  title,
}: AsyncStateProps) {
  return (
    <section
      aria-busy={status === 'loading'}
      aria-live="polite"
      className="rounded-lg border border-border p-6"
    >
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {status !== 'loading' && onRetry ? (
        <Button className="mt-4" onClick={onRetry} variant="outline">
          {status === 'empty' ? 'Сбросить фильтры' : 'Повторить'}
        </Button>
      ) : null}
      {status === 'loading' ? (
        <div className="mt-4 grid gap-2" aria-hidden="true">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ) : null}
    </section>
  )
}
