import { Link } from 'react-router-dom'

import { cn } from '@/shared/lib/cn'

type BrandLogoProps = {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <Link
      aria-label="Аудиовизитка — на главную"
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      to="/"
    >
      <svg
        aria-hidden="true"
        className="h-7 w-8 text-primary"
        viewBox="0 0 40 28"
      >
        <path
          d="M1 14h5l2.5-7 3 14 4-19 4.5 24 4-19 3 14 3-10 2 6h7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.8"
        />
      </svg>
      <span className="text-lg sm:text-xl">Аудиовизитка</span>
    </Link>
  )
}
