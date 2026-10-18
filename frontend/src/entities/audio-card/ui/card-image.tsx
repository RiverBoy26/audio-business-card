import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'

import { getCardPhotoBlob } from '@/entities/audio-card/api/audio-card-api'
import { cn } from '@/shared/lib/cn'

type CardImageProps = {
  alt: string
  className?: string
  src: string
}

function ImageFallback({ alt, className }: Pick<CardImageProps, 'alt' | 'className'>) {
  return <span aria-label={alt || 'Фото недоступно'} className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)} role="img"><UserRound aria-hidden="true" className="size-1/2" /></span>
}

function ProtectedCardImage({ alt, className, src }: CardImageProps) {
  const [loadedImage, setLoadedImage] = useState<{ src: string; url: string } | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let createdUrl: string | null = null
    void getCardPhotoBlob(src)
      .then((blob) => {
        if (!active) return
        createdUrl = URL.createObjectURL(blob)
        setLoadedImage({ src, url: createdUrl })
      })
      .catch(() => {
        if (active) setFailedSrc(src)
      })
    return () => {
      active = false
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [src])

  if (loadedImage?.src === src) return <img alt={alt} className={className} src={loadedImage.url} />
  if (failedSrc === src) return <ImageFallback alt={alt} className={className} />
  return <div aria-label={alt} className={cn('animate-pulse bg-muted', className)} />
}

function DirectCardImage({ alt, className, src }: CardImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  return failedSrc === src
    ? <ImageFallback alt={alt} className={className} />
    : <img alt={alt} className={className} onError={() => setFailedSrc(src)} src={src} />
}

export function CardImage(props: CardImageProps) {
  return props.src.startsWith('/audio-cards/') || props.src.startsWith('/api/v1/applications/')
    ? <ProtectedCardImage {...props} />
    : <DirectCardImage {...props} />
}
