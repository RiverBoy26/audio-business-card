import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

export function HomePage() {
  return (
    <main className="bg-card">
      <section
        aria-labelledby="hero-title"
        className="mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-5 lg:px-12"
      >
        <div className="relative z-10 max-w-[38rem]">
          <h1
            className="text-[clamp(2.25rem,5vw,4.75rem)] font-bold leading-[1.08] tracking-[-0.035em]"
            id="hero-title"
          >
            Твоё портфолио<br />звучит <span className="whitespace-nowrap">по-новому</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Дополни резюме живым рассказом о себе, добавь музыку и поделись готовой визиткой по ссылке.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="h-12 px-6 text-base" size="lg">
              <Link to="/create">Создать визитку</Link>
            </Button>
            <Button asChild className="h-12 border-primary/60 bg-card px-6 text-base" size="lg" variant="outline">
              <Link to="/open">Открыть по коду</Link>
            </Button>
          </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none relative hidden min-w-0 items-center justify-center md:flex">
          <img
            alt=""
            className="w-full max-w-[39rem] object-contain opacity-80"
            src="/assets/hero-audio.png"
          />
        </div>
      </section>
    </main>
  )
}
