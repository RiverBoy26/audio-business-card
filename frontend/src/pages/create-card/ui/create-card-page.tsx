import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BriefcaseBusiness, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  deleteCardDocument,
  getCardDraft,
  publishAudioCard,
  saveCardDraft,
  unpublishAudioCard,
} from '@/entities/audio-card/api/audio-card-api'
import {
  initialCardDraft,
  type CardDraft,
} from '@/entities/audio-card/model/types'
import { ProfileDataForm } from '@/features/card-editor/ui/profile-data-form'
import { VoiceStoryEditor } from '@/features/card-editor/ui/voice-story-editor'
import { useAuth } from '@/features/auth/model/use-auth'
import { AsyncState } from '@/shared/ui/async-state'
import { CardPreview } from '@/widgets/card-preview/ui/card-preview'

type CardEditorProps = {
  cardId?: string
  initialDraft: CardDraft
}

function CardEditor({ cardId, initialDraft: loadedDraft }: CardEditorProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(() => ({
    ...loadedDraft,
    fullName: loadedDraft.fullName || [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(' '),
    contactEmail: loadedDraft.contactEmail || user?.email || '',
    contactPhone: loadedDraft.contactPhone || user?.phone || '',
  }))
  const [saved, setSaved] = useState(false)
  const [publishedCardId, setPublishedCardId] = useState(cardId)
  const saveMutation = useMutation({
    mutationFn: () => saveCardDraft(draft, cardId),
    onSuccess: async (card) => {
      setDraft((current) => ({
        ...current,
        documentFile: null,
        documentName: card.documentName,
        documentUrl: card.documentUrl,
      }))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
      await queryClient.invalidateQueries({ queryKey: ['audio-cards'] })
      if (!cardId) navigate(`/cards/${card.id}/edit`, { replace: true })
    },
  })
  const publishMutation = useMutation({
    mutationFn: async () => {
      const savedCard = await saveCardDraft(draft, cardId)
      return publishAudioCard(savedCard.id)
    },
    onSuccess: async (card) => {
      setPublishedCardId(card.id)
      setDraft((current) => ({
        ...current,
        documentFile: null,
        documentName: card.documentName,
        documentUrl: card.documentUrl,
        published: true,
        publicCode: card.publicCode,
      }))
      await queryClient.invalidateQueries({ queryKey: ['audio-cards'] })
      if (!cardId) navigate(`/cards/${card.id}/edit`, { replace: true })
    },
  })
  const unpublishMutation = useMutation({
    mutationFn: () => unpublishAudioCard(publishedCardId!),
    onSuccess: async () => {
      setDraft((current) => ({ ...current, published: false, publicCode: null }))
      await queryClient.invalidateQueries({ queryKey: ['audio-cards'] })
      await queryClient.invalidateQueries({ queryKey: ['public-audio-card', publishedCardId] })
    },
  })
  const deleteDocumentMutation = useMutation({
    mutationFn: () => deleteCardDocument(cardId!),
    onSuccess: async () => {
      setDraft((current) => ({
        ...current,
        documentFile: null,
        documentName: null,
        documentUrl: null,
      }))
      await queryClient.invalidateQueries({ queryKey: ['audio-cards'] })
      await queryClient.invalidateQueries({ queryKey: ['public-audio-card', cardId] })
    },
  })

  function deleteDocument() {
    if (cardId) {
      deleteDocumentMutation.mutate()
      return
    }
    setDraft((current) => ({
      ...current,
      documentFile: null,
      documentName: null,
      documentUrl: null,
    }))
  }

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 lg:py-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          {cardId ? 'Редактирование' : 'Новая визитка'}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {cardId ? 'Изменить визитку' : 'Создать визитку'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Данные, голос и музыка — в одной карточке.
        </p>
      </header>

      <div className="mt-5 inline-flex overflow-hidden rounded-lg border border-border bg-card">
        <button
          aria-pressed={draft.cardType === 'RESUME'}
          className={`flex h-10 items-center gap-2 border-r border-border px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${draft.cardType === 'RESUME' ? 'bg-accent text-primary' : 'hover:bg-muted'}`}
          onClick={() => setDraft({ ...draft, cardType: 'RESUME' })}
          type="button"
        >
          <BriefcaseBusiness className="size-4" />
          Для резюме
        </button>
        <button
          aria-pressed={draft.cardType === 'PORTFOLIO'}
          className={`flex h-10 items-center gap-2 px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${draft.cardType === 'PORTFOLIO' ? 'bg-accent text-primary' : 'hover:bg-muted'}`}
          onClick={() => setDraft({ ...draft, cardType: 'PORTFOLIO' })}
          type="button"
        >
          <FolderOpen className="size-4" />
          Для портфолио
        </button>
      </div>
      <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
        {draft.cardType === 'RESUME'
          ? 'Для резюме укажите должность, на которую откликаетесь, и прикрепите PDF с резюме.'
          : 'Для портфолио укажите желаемую роль внутри команды и прикрепите PDF с работами.'}
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)]">
        <div className="min-w-0 grid gap-4">
          <ProfileDataForm avatarUrl={user?.avatarUrl ?? null} draft={draft} onChange={setDraft} />
          <VoiceStoryEditor draft={draft} onChange={setDraft} />
        </div>
        <CardPreview
          cardId={publishedCardId}
          draft={draft}
          error={unpublishMutation.error instanceof Error
            ? unpublishMutation.error.message
            : deleteDocumentMutation.error instanceof Error
            ? deleteDocumentMutation.error.message
            : publishMutation.error instanceof Error
            ? publishMutation.error.message
            : saveMutation.error instanceof Error ? saveMutation.error.message : null}
          isPublishing={publishMutation.isPending || unpublishMutation.isPending}
          isSaving={saveMutation.isPending}
          isDocumentDeleting={deleteDocumentMutation.isPending}
          onDocumentDelete={deleteDocument}
          onDocumentSelect={(file) => setDraft((current) => ({
            ...current,
            documentFile: file,
            documentName: file.name,
          }))}
          onDraftChange={setDraft}
          onPublish={() => publishMutation.mutate()}
          onUnpublish={() => unpublishMutation.mutate()}
          onSave={() => saveMutation.mutate()}
          saved={saved}
        />
      </div>
    </main>
  )
}

export function CreateCardPage() {
  const { cardId } = useParams()
  const draftQuery = useQuery({
    queryKey: ['audio-card-draft', cardId],
    queryFn: () => getCardDraft(cardId!),
    enabled: Boolean(cardId),
  })

  if (draftQuery.isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <AsyncState
          description="Получаем карточку, опыт и настройки."
          status="loading"
          title="Загружаем визитку"
        />
      </main>
    )
  }

  if (draftQuery.isError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <AsyncState
          description={draftQuery.error instanceof Error ? draftQuery.error.message : 'Повторите запрос.'}
          onRetry={() => void draftQuery.refetch()}
          status="error"
          title="Не удалось загрузить визитку"
        />
      </main>
    )
  }

  return (
    <CardEditor
      cardId={cardId}
      initialDraft={draftQuery.data ?? initialCardDraft}
      key={cardId ?? 'new'}
    />
  )
}
