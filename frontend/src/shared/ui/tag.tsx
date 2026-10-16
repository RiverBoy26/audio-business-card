import { X } from 'lucide-react'

type TagProps = {
  children: string
  onRemove?: () => void
}

export function Tag({ children, onRemove }: TagProps) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-md bg-accent px-2.5 text-xs font-medium text-accent-foreground">
      {children}
      {onRemove ? (
        <button
          aria-label={`Удалить ${children}`}
          className="rounded-sm p-0.5 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onRemove}
          type="button"
        >
          <X aria-hidden="true" className="size-3" />
        </button>
      ) : null}
    </span>
  )
}
