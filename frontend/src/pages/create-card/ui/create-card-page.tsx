import { BriefcaseBusiness, FolderOpen } from 'lucide-react'
import { useState } from 'react'

import { initialCardDraft } from '@/entities/audio-card/model/mock-data'
import type { CardDraft } from '@/entities/audio-card/model/types'
import { ProfileDataForm } from '@/features/card-editor/ui/profile-data-form'
import { VoiceStoryEditor } from '@/features/card-editor/ui/voice-story-editor'
import { cn } from '@/shared/lib/cn'
import { CardPreview } from '@/widgets/card-preview/ui/card-preview'

type CardKind = 'resume' | 'portfolio'

export function CreateCardPage() {
  const [kind, setKind] = useState<CardKind>('resume')
  const [draft, setDraft] = useState<CardDraft>(initialCardDraft)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          Новая визитка
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Создать визитку
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Данные, голос и музыка — в одной карточке.
        </p>

        <div className="mt-5 inline-grid grid-cols-2 overflow-hidden rounded-md border border-border bg-card">
          <button
            aria-pressed={kind === 'resume'}
            className={cn(
              'flex h-10 items-center gap-2 border-r border-border px-4 text-sm font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
              kind === 'resume' && 'bg-accent text-primary',
            )}
            onClick={() => setKind('resume')}
            type="button"
          >
            <BriefcaseBusiness aria-hidden="true" className="size-4" />
            Для резюме
          </button>
          <button
            aria-pressed={kind === 'portfolio'}
            className={cn(
              'flex h-10 items-center gap-2 px-4 text-sm font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
              kind === 'portfolio' && 'bg-accent text-primary',
            )}
            onClick={() => setKind('portfolio')}
            type="button"
          >
            <FolderOpen aria-hidden="true" className="size-4" />
            Для портфолио
          </button>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="grid gap-4">
          <ProfileDataForm draft={draft} onChange={setDraft} />
          <VoiceStoryEditor />
        </div>
        <CardPreview draft={draft} />
      </div>
    </main>
  )
}
