import { cn } from '@/shared/lib/cn'

type RecruitmentVisualProps = {
  className?: string
  label: string
}

export function RecruitmentVisual({ className, label }: RecruitmentVisualProps) {
  const initial = label.trim().charAt(0).toLocaleUpperCase('ru') || 'М'

  return (
    <div
      aria-hidden="true"
      className={cn('flex shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-2xl font-semibold text-primary', className)}
    >
      {initial}
    </div>
  )
}
