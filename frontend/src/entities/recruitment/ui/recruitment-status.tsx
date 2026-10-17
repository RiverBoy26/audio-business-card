import type { ApplicationStatus, RecruitmentStatus } from '@/entities/recruitment/model/types'
import { cn } from '@/shared/lib/cn'

const recruitmentLabels: Record<RecruitmentStatus, string> = {
  DRAFT: 'Черновик',
  OPEN: 'Идёт набор',
  CLOSED: 'Набор закрыт',
  ARCHIVED: 'В архиве',
}

const applicationLabels: Record<ApplicationStatus, string> = {
  PENDING: 'На рассмотрении',
  ACCEPTED: 'Принят',
  REJECTED: 'Отклонён',
  WITHDRAWN: 'Отозван',
}

type StatusBadgeProps = {
  kind?: 'application' | 'recruitment'
  status: ApplicationStatus | RecruitmentStatus
}

export function StatusBadge({ kind = 'recruitment', status }: StatusBadgeProps) {
  const label = kind === 'application'
    ? applicationLabels[status as ApplicationStatus]
    : recruitmentLabels[status as RecruitmentStatus]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold',
        status === 'OPEN' || status === 'ACCEPTED'
          ? 'bg-emerald-50 text-emerald-700'
          : status === 'PENDING'
            ? 'bg-amber-50 text-amber-700'
            : status === 'REJECTED'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-muted text-muted-foreground',
      )}
    >
      {label}
    </span>
  )
}
