import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

const waveBars = [
  58, 76, 96, 122, 154, 112, 78, 104, 136, 92, 126, 174, 224, 260, 224,
  174, 126, 92, 70,
]

export function HomePage() {
  return (
    <main className="relative isolate min-h-[calc(100svh-5rem-1px)] overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-7rem] top-[7rem] hidden aspect-square w-[min(60vw,54rem)] opacity-[0.32] lg:block"
      >
        <img alt="" className="size-full object-contain" src="/assets/main-page-circle.png" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[29.5%] right-[9%] top-[53.5%] hidden -translate-y-1/2 items-center justify-center gap-[clamp(0.45rem,1.1vw,1.1rem)] lg:flex"
      >
        {waveBars.map((height, index) => (
          <span
            className="w-8 shrink-0 rounded-full bg-[#a99bff]/75"
            key={`${height}-${index}`}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      <section
        aria-labelledby="hero-title"
        className="relative z-10 flex min-h-[calc(100svh-5rem-1px)] items-center px-5 py-10 sm:px-10 sm:py-14 lg:px-[6.45vw] lg:py-20"
      >
        <div className="w-full max-w-[62rem] lg:-translate-y-[1.1rem]">
          <h1
            className="text-[clamp(2.75rem,7.55vw,6.8rem)] font-bold leading-[1.02] tracking-[-0.045em]"
            id="hero-title"
          >
            Твоё портфолио
            <br />
            звучит по-новому
          </h1>

          <p className="mt-8 max-w-[52rem] text-[clamp(1.05rem,2.35vw,2.15rem)] font-bold leading-[1.35] tracking-[-0.025em] text-black sm:mt-12 lg:mt-16">
            Дополни резюме живым рассказом о себе, добавляй музыкальное
            сопровождение и делись готовой визиткой по ссылке.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:mt-16 sm:flex-row sm:flex-wrap lg:mt-24">
            <Button asChild className="h-14 rounded-xl px-6 text-[clamp(1.15rem,2.4vw,2.2rem)] font-medium sm:h-[5.5rem] sm:min-w-[18rem] sm:px-9 lg:min-w-[23rem]" size="lg">
              <Link to="/create">Создать визитку</Link>
            </Button>
            <Button asChild className="h-14 rounded-xl border-[3px] bg-card px-6 text-[clamp(1.15rem,2.4vw,2.2rem)] font-medium hover:bg-accent sm:h-[5.5rem] sm:min-w-[18rem] sm:border-[4px] sm:px-8 lg:min-w-[23rem]" size="lg" style={{ borderColor: 'var(--primary)' }} variant="outline">
              <Link to="/open">Открыть визитку</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
