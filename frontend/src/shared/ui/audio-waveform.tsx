import type { KeyboardEvent, PointerEvent } from 'react'

import { cn } from '@/shared/lib/cn'

const bars = [
  18, 36, 58, 32, 72, 48, 26, 62, 82, 46, 68, 32, 22, 54, 76, 42, 64, 30,
  50, 72, 38, 60, 28, 44, 34, 24, 18, 30, 16, 22, 14, 18,
]

type AudioWaveformProps = {
  className?: string
  expanded?: boolean
  progress?: number
  onSeek?: (progress: number) => void
}

export function AudioWaveform({
  className,
  expanded = false,
  progress = 0,
  onSeek,
}: AudioWaveformProps) {
  const displayedBars = expanded ? [...bars, ...bars, ...bars.slice(0, 8)] : bars
  const normalizedProgress = Math.min(1, Math.max(0, progress))

  function seek(clientX: number, element: HTMLDivElement) {
    if (!onSeek) return
    const bounds = element.getBoundingClientRect()
    if (bounds.width <= 0) return
    onSeek(Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!onSeek) return
    let next: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = normalizedProgress + 0.05
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = normalizedProgress - 0.05
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = 1
    if (next === null) return
    event.preventDefault()
    onSeek(Math.min(1, Math.max(0, next)))
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!onSeek) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    seek(event.clientX, event.currentTarget)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!onSeek || event.buttons !== 1) return
    seek(event.clientX, event.currentTarget)
  }

  return (
      <div
          aria-label={onSeek ? 'Позиция аудио' : undefined}
          aria-valuemax={onSeek ? 100 : undefined}
          aria-valuemin={onSeek ? 0 : undefined}
          aria-valuenow={onSeek ? Math.round(normalizedProgress * 100) : undefined}
          className={cn(
              'relative flex h-10 min-w-0 flex-1 items-center',
              onSeek && 'cursor-pointer touch-none select-none',
              className,
          )}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          role={onSeek ? 'slider' : undefined}
          tabIndex={onSeek ? 0 : undefined}
      >
        <div
            className={cn(
                'pointer-events-none flex h-full w-full items-center',
                expanded ? 'gap-px' : 'gap-[2px]',
            )}
        >
          {displayedBars.map((height, index) => (
              <span
                  className={cn(
                      'min-w-0 flex-1 rounded-full bg-border',
                  )}
                  key={`${height}-${index}`}
                  style={{
                    height: `${height}%`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
              >
          <span
              className="absolute inset-0 bg-primary"
              style={{
                clipPath: `inset(0 ${
                    Math.max(
                        0,
                        Math.min(
                            100,
                            (index + 1 - normalizedProgress * displayedBars.length) * 100,
                        ),
                    )
                }% 0 0)`,
              }}
          />
        </span>
          ))}
        </div>
      </div>
  )
}
