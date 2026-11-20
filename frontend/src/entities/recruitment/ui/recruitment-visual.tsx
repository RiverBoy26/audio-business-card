import { AudioLines, Braces, Lightbulb, Rocket, Sparkles } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

const icons = [Rocket, Braces, Lightbulb, AudioLines, Sparkles]
const gradients = [
  'from-[#6c55f6] to-[#a59aff]',
  'from-[#332b72] to-[#7965f4]',
  'from-[#7c4dff] to-[#dc8dff]',
  'from-[#315f81] to-[#7b61ff]',
  'from-[#7558d9] to-[#ee8fae]',
]

function hash(value: string) {
  return [...value].reduce((result, character) => result + character.charCodeAt(0), 0)
}

type RecruitmentVisualProps = {
  className?: string
  seed: string
}

export function RecruitmentVisual({ className, seed }: RecruitmentVisualProps) {
  const index = hash(seed) % icons.length
  const Icon = icons[index]

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative isolate flex shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] bg-gradient-to-br text-white',
        gradients[index],
        className,
      )}
    >
      <span className="absolute -right-6 -top-8 size-28 rounded-full border-[18px] border-white/15" />
      <span className="absolute -bottom-12 -left-8 size-32 rounded-full border-[24px] border-white/10" />
      <Icon className="relative z-10 size-[34%] stroke-[1.7]" />
    </div>
  )
}
