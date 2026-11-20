import { useState } from 'react'

import { cn } from '@/shared/lib/cn'

type UserAvatarProps = {
  alt?: string
  avatarUrl: string | null
  className?: string
  firstName: string
  lastName: string
  revision?: number
}

export function UserAvatar({
  alt = '',
  avatarUrl,
  className,
  firstName,
  lastName,
  revision = 0,
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const initials = `${firstName.at(0) ?? ''}${lastName.at(0) ?? ''}`
    .toLocaleUpperCase('ru')
  const src = avatarUrl
    ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${revision}`
    : null

  return (
    <span
      className={cn(
        'relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-primary',
        className,
      )}
    >
      <span aria-hidden="true">{initials || 'А'}</span>
      {src && failedSrc !== src ? (
        <img
          alt={alt}
          className="absolute inset-0 size-full rounded-[inherit] object-cover"
          onError={() => setFailedSrc(src)}
          src={src}
        />
      ) : null}
    </span>
  )
}
