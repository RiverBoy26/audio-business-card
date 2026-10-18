import { Link } from 'react-router-dom'

import { cn } from '@/shared/lib/cn'

type BrandLogoProps = {
  className?: string
  imageClassName?: string
}

export function BrandLogo({ className, imageClassName }: BrandLogoProps) {
  return (
    <Link
      aria-label="HackSound — на главную"
      className={cn(
        'inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      to="/"
    >
      <span className={cn('inline-flex items-center gap-1.5 text-[1.45rem] font-extrabold tracking-[-0.04em] text-foreground sm:text-[1.75rem]', imageClassName)}>
        <svg aria-hidden="true" className="h-8 w-10 shrink-0 text-foreground sm:h-9 sm:w-12" fill="none" viewBox="0 0 54 34">
          <path d="M2 18h6l3-8 4 18 5-25 5 29 5-20 4 12 4-9 4 5h10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </svg>
        <span className="max-[380px]:sr-only">HackSound</span>
      </span>
    </Link>
  )
}
