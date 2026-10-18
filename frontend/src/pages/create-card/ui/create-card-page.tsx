import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  const profileFullName = [user?.lastName, user?.firstName, user?.middleName].filter(Boolean).join(' ')
  const [draft, setDraft] = useState(() => ({
    ...loadedDraft,
    fullName: profileFullName || loadedDraft.fullName,
    contactEmail: loadedDraft.contactEmail || user?.email || '',
    contactPhone: loadedDraft.contactPhone || user?.phone || '',
    showContactEmail: cardId ? loadedDraft.showContactEmail : Boolean(user?.email),
    showContactPhone: cardId ? loadedDraft.showContactPhone : Boolean(user?.phone),
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
        photoFile: null,
        photoUrl: card.photoUrl ?? '',
        published: card.published,
        publicCode: card.publicCode,
      }))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
      await queryClient.invalidateQueries({ queryKey: ['audio-cards'] })
      if (card.published) {
        await queryClient.invalidateQueries({ queryKey: ['public-audio-card', card.id] })
      }
      if (!cardId) navigate(`/create?id=${card.id}`, { replace: true })
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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {cardId ? 'Изменить визитку' : 'Создать визитку'}
        </h1>
      </header>

      <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
        Укажите желаемую роль в команде и при необходимости прикрепите PDF с работами.
      </p>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.03fr)_minmax(0,1fr)]">
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
