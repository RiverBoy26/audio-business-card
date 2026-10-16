import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

export function HomePage() {
  return (
    <main className="overflow-hidden bg-card">
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem-1px)] w-full max-w-7xl items-center overflow-hidden px-4 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
        <section className="relative z-10 max-w-2xl" aria-labelledby="hero-title">
          <h1
            id="hero-title"
            className="text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl"
          >
            Твоё портфолио
            <br />
            звучит по-новому
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-foreground/75 sm:text-lg">
            Дополни резюме живым рассказом о себе, добавь музыкальное
            сопровождение и делись готовой визиткой по ссылке.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/create">Создать визитку</Link>
            </Button>
            <Button asChild size="lg" variant="outline"><Link to="/open">Открыть визитку</Link></Button>
          </div>
        </section>

        <div className="pointer-events-none absolute -right-[28%] top-0 h-full w-[90%] sm:-right-[18%] lg:-right-[8%] lg:w-[66%]">
          <img alt="" className="h-full w-full object-contain object-right opacity-80" src="/assets/main-page-circle.png" />
        </div>
      </div>
    </main>
  )
}
