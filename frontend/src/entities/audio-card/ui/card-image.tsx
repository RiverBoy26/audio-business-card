import { useEffect, useState } from 'react'

import { getCardPhotoBlob } from '@/entities/audio-card/api/audio-card-api'
import { cn } from '@/shared/lib/cn'

type CardImageProps = {
  alt: string
  className?: string
  src: string
}

function ProtectedCardImage({ alt, className, src }: CardImageProps) {
  const [loadedImage, setLoadedImage] = useState<{ src: string; url: string } | null>(null)

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
        // The placeholder remains visible if the protected image is unavailable.
      })
    return () => {
      active = false
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [src])

  return loadedImage?.src === src ? <img alt={alt} className={className} src={loadedImage.url} /> : <div aria-label={alt} className={cn('animate-pulse bg-muted', className)} />
}

export function CardImage(props: CardImageProps) {
  return props.src.startsWith('/audio-cards/') || props.src.startsWith('/api/v1/applications/')
    ? <ProtectedCardImage {...props} />
    : <img {...props} />
}
