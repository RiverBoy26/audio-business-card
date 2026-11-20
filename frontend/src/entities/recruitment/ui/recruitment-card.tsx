import { ArrowRight, CalendarDays, MapPin, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Recruitment } from '@/entities/recruitment/model/types'
import { RecruitmentVisual } from '@/entities/recruitment/ui/recruitment-visual'
import { formatDate } from '@/shared/lib/format-date'
import { pluralizeRu } from '@/shared/lib/pluralize-ru'
import { Button } from '@/shared/ui/button'
import { Tag } from '@/shared/ui/tag'

const formatLabels = {
  ONLINE: 'Онлайн',
  OFFLINE: 'Очно',
  HYBRID: 'Гибрид',
} as const

type RecruitmentCardProps = {
  recruitment: Recruitment
  score?: number
}

export function RecruitmentCard({ recruitment, score }: RecruitmentCardProps) {
  const placesLeft = Math.max(0, recruitment.participantsNeeded - recruitment.acceptedCount)

  return (
    <article className="group flex min-w-0 flex-col rounded-[1.6rem] border border-border bg-card p-5 shadow-[0_14px_45px_rgba(13,10,51,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/35">
      <div className="flex items-start gap-4">
        <RecruitmentVisual className="h-36 w-28 shrink-0 rounded-2xl" seed={recruitment.id} />
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-xl font-bold">{recruitment.eventName}</h2>
            {score !== undefined ? (
              <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-primary">
                {score}% мэтч
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-primary">{recruitment.title}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <UsersRound className="size-3.5 text-primary" />
              {placesLeft} {pluralizeRu(placesLeft, 'место', 'места', 'мест')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" />
              до {formatDate(recruitment.deadline)}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {recruitment.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex min-h-7 flex-wrap gap-2">
        {recruitment.requiredSkills.slice(0, 4).map((skill) => (
          <Tag key={skill}>{skill}</Tag>
        ))}
        {recruitment.requiredSkills.length > 4 ? (
          <Tag>{`+${recruitment.requiredSkills.length - 4}`}</Tag>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{recruitment.location || formatLabels[recruitment.format]}</span>
        </span>
        <Button asChild className="group/button shrink-0" size="sm">
          <Link to={`/events/${recruitment.id}`}>
            Подробнее
            <ArrowRight className="size-3.5 transition group-hover/button:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}
