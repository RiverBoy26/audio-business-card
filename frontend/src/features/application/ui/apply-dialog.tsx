import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Send, Volume2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { getAudioCards } from '@/entities/audio-card/api/audio-card-api'
import { applyToRecruitment } from '@/entities/recruitment/api/recruitment-api'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'

type ApplyDialogProps = {
  onClose: () => void
  onSuccess: () => void
  open: boolean
  recruitmentId: string
  recruitmentTitle: string
}

export function ApplyDialog({
  onClose,
  onSuccess,
  open,
  recruitmentId,
  recruitmentTitle,
}: ApplyDialogProps) {
  const queryClient = useQueryClient()
  const [cardId, setCardId] = useState('')
  const [message, setMessage] = useState('')
  const cardsQuery = useQuery({
    queryKey: ['audio-cards'],
    queryFn: getAudioCards,
    enabled: open,
  })
  const savedCards = cardsQuery.data ?? []
  const selectedCardId = cardId || savedCards[0]?.id || ''
  const mutation = useMutation({
    mutationFn: () => applyToRecruitment(recruitmentId, selectedCardId, message),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
        queryClient.invalidateQueries({ queryKey: ['recruitment-recommendations'] }),
      ])
      onSuccess()
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (selectedCardId) mutation.mutate()
  }

  return (
    <Modal className="max-w-xl" onClose={onClose} open={open} title="Отправить заявку">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Отклик в команду</p>
      <h2 className="mt-2 pr-8 text-2xl font-bold">{recruitmentTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Выберите любую сохранённую аудиовизитку. Автор объявления сможет открыть и прослушать её в рамках заявки.
      </p>

      <form className="mt-6" onSubmit={submit}>
        {cardsQuery.isLoading ? (
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
        ) : savedCards.length ? (
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-xs font-bold">Ваша визитка</legend>
            {savedCards.map((card) => (
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selectedCardId === card.id ? 'border-primary bg-accent/70' : 'border-border hover:border-primary/40'}`}
                key={card.id}
              >
                <input
                  checked={selectedCardId === card.id}
                  className="sr-only"
                  name="audio-card"
                  onChange={() => setCardId(card.id)}
                  type="radio"
                  value={card.id}
                />
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <Volume2 className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{card.fullName || card.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{card.title} · {card.published ? 'Опубликована' : 'Черновик'}</span>
                </span>
                {selectedCardId === card.id ? <Check className="size-5 text-primary" /> : null}
              </label>
            ))}
          </fieldset>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">
            Для отклика нужна сохранённая визитка. Создайте её в разделе «Мои визитки».
          </div>
        )}

        <label className="mt-5 grid gap-1.5 text-xs font-bold" htmlFor="application-message">
          Сообщение команде <span className="font-normal text-muted-foreground">(необязательно)</span>
          <textarea
            className="min-h-28 resize-y rounded-xl border border-border px-3 py-3 text-sm font-normal leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            id="application-message"
            maxLength={1000}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Почему вам интересна эта команда?"
            value={message}
          />
        </label>

        {mutation.isError ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {mutation.error instanceof Error ? mutation.error.message : 'Не удалось отправить заявку.'}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button disabled={mutation.isPending} onClick={onClose} type="button" variant="outline">Отмена</Button>
          <Button disabled={!selectedCardId || mutation.isPending} type="submit">
            <Send className="size-4" />
            {mutation.isPending ? 'Отправляем…' : 'Отправить заявку'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
