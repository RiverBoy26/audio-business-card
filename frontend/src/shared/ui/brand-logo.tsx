import { Link } from 'react-router-dom'

import { cn } from '@/shared/lib/cn'

type BrandLogoProps = {
  className?: string
  imageClassName?: string
}

export function BrandLogo({ className, imageClassName }: BrandLogoProps) {
  return (
    <Link
      aria-label="Аудиовизитка — на главную"
      className={cn(
        'inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      to="/"
    >
      <img
        alt="Аудиовизитка"
        className={cn('h-auto w-52 sm:w-64', imageClassName)}
        src="/assets/logo.png"
      />
    </Link>
  )
}
