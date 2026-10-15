import { cn } from '@/shared/lib/cn'

const bars = [
  18, 36, 58, 32, 72, 48, 26, 62, 82, 46, 68, 32, 22, 54, 76, 42, 64, 30,
  50, 72, 38, 60, 28, 44, 34, 24, 18, 30, 16, 22, 14, 18,
]

type AudioWaveformProps = {
  className?: string
  progress?: number
}

export function AudioWaveform({
  className,
  progress = 0.68,
}: AudioWaveformProps) {
  const activeBars = Math.round(bars.length * progress)

  return (
    <div
      aria-hidden="true"
      className={cn('flex h-10 flex-1 items-center gap-[2px]', className)}
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
