import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

function SoundRings() {
  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full text-primary"
      viewBox="0 0 520 520"
    >
      <circle
        cx="260"
        cy="260"
        fill="none"
        opacity=".52"
        r="220"
        stroke="currentColor"
        strokeDasharray="334 28"
        strokeWidth="22"
      />
      <circle
        cx="260"
        cy="260"
        fill="none"
        opacity=".62"
        r="158"
        stroke="currentColor"
        strokeDasharray="232 28"
        strokeWidth="20"
      />
      <circle
        cx="260"
        cy="260"
        fill="none"
        opacity=".72"
        r="98"
        stroke="currentColor"
        strokeDasharray="140 24"
        strokeWidth="19"
      />
      <path
        d="M260 112v296M113 260h294"
        opacity=".98"
        stroke="white"
        strokeWidth="28"
      />
    </svg>
  )
}

export function HomePage() {
  return (
    <main className="overflow-hidden bg-card">
      <div className="mx-auto grid min-h-[calc(100svh-4rem-1px)] w-full max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
        <section className="relative z-10 max-w-2xl" aria-labelledby="hero-title">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Портфолио, которое слышно
          </p>
          <h1
            id="hero-title"
            className="text-4xl font-bold leading-[1.06] tracking-[-0.035em] sm:text-5xl lg:text-6xl"
          >
            Твоё портфолио
            <br />
            звучит по-новому
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-foreground/75 sm:text-lg">
            Дополни резюме живым рассказом о себе, добавь музыкальное
            сопровождение и делись готовой визиткой по ссылке.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link to="/create">
                Создать визитку
                <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
            </Button>
            <Link
              className="rounded-md px-2 py-2 text-sm font-medium text-foreground/70 underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              to="/cards"
            >
              Посмотреть пример
            </Link>
          </div>
        </section>

        <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <div className="absolute inset-1/4 rounded-full bg-primary/5 blur-3xl" />
          <SoundRings />
        </div>
      </div>
    </main>
  )
}
