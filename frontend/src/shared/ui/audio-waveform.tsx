import type { MouseEvent } from 'react'

import { cn } from '@/shared/lib/cn'

const bars = [
  18, 36, 58, 32, 72, 48, 26, 62, 82, 46, 68, 32, 22, 54, 76, 42, 64, 30,
  50, 72, 38, 60, 28, 44, 34, 24, 18, 30, 16, 22, 14, 18,
]

type AudioWaveformProps = {
  className?: string
  progress?: number
  onSeek?: (progress: number) => void
}

export function AudioWaveform({
  className,
  progress = 0,
  onSeek,
}: AudioWaveformProps) {
  const normalizedProgress = Math.min(1, Math.max(0, progress))
  const activeBars = Math.round(bars.length * normalizedProgress)

  function seek(event: MouseEvent<HTMLDivElement>) {
    if (!onSeek) return
    const bounds = event.currentTarget.getBoundingClientRect()
    onSeek((event.clientX - bounds.left) / bounds.width)
  }

  return (
    <div
      aria-label={onSeek ? 'Позиция аудио' : undefined}
      aria-valuemax={onSeek ? 100 : undefined}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuenow={onSeek ? Math.round(normalizedProgress * 100) : undefined}
      className={cn('flex h-10 flex-1 items-center gap-[2px]', onSeek && 'cursor-pointer', className)}
      onClick={seek}
      onKeyDown={(event) => {
        if (!onSeek) return
        if (event.key === 'ArrowRight') onSeek(Math.min(1, normalizedProgress + 0.05))
        if (event.key === 'ArrowLeft') onSeek(Math.max(0, normalizedProgress - 0.05))
      }}
      role={onSeek ? 'slider' : undefined}
      tabIndex={onSeek ? 0 : undefined}
    >
      {bars.map((height, index) => (
        <span
          className={cn(
            'w-full min-w-[2px] max-w-1 rounded-full',
            index < activeBars ? 'bg-primary' : 'bg-border',
          )}
          key={`${height}-${index}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}
