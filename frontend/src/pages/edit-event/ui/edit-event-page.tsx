import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  changeRecruitmentStatus,
  createRecruitment,
  getMyRecruitments,
  updateRecruitment,
} from '@/entities/recruitment/api/recruitment-api'
import { initialRecruitmentDraft } from '@/entities/recruitment/model/types'
import { RecruitmentForm } from '@/features/recruitment-editor/ui/recruitment-form'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'

export function EditEventPage() {
  const { recruitmentId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mineQuery = useQuery({
    queryKey: ['recruitments', 'mine'],
    queryFn: getMyRecruitments,
    enabled: Boolean(recruitmentId),
  })
  const recruitment = mineQuery.data?.find((item) => item.id === recruitmentId)
  const mutation = useMutation({
    mutationFn: async ({ draft, publish }: { draft: typeof initialRecruitmentDraft; publish: boolean }) => {
      const saved = recruitmentId
        ? await updateRecruitment(recruitmentId, draft)
        : await createRecruitment(draft)
      return publish && saved.status !== 'OPEN'
        ? changeRecruitmentStatus(saved.id, 'publish')
        : saved
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recruitments'] }),
        queryClient.invalidateQueries({ queryKey: ['recruitment-recommendations'] }),
      ])
      navigate('/my-events')
    },
  })

  if (recruitmentId && mineQuery.isLoading) {
    return <main className="mx-auto max-w-4xl px-4 py-12"><AsyncState description="Получаем данные объявления." status="loading" title="Загружаем набор" /></main>
  }
  if (recruitmentId && (mineQuery.isError || !recruitment)) {
    return <main className="mx-auto max-w-4xl px-4 py-12"><AsyncState description={mineQuery.error instanceof Error ? mineQuery.error.message : 'Объявление не найдено среди ваших наборов.'} onRetry={() => void mineQuery.refetch()} status="error" title="Не удалось открыть набор" /></main>
  }

  const initialDraft = recruitment ? {
    title: recruitment.title,
    eventName: recruitment.eventName,
    description: recruitment.description,
    participantsNeeded: recruitment.participantsNeeded,
    requiredSkills: recruitment.requiredSkills,
    format: recruitment.format,
    location: recruitment.location,
    eventUrl: recruitment.eventUrl,
    deadline: recruitment.deadline,
  } : initialRecruitmentDraft

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Button asChild className="-ml-3" variant="ghost"><Link to="/my-events"><ArrowLeft className="size-4" />Мои мероприятия</Link></Button>
      <header className="mb-8 mt-4">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">{recruitment ? 'Редактирование набора' : 'Новый набор'}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">{recruitment ? 'Изменить объявление' : 'Собрать команду'}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Заполните основную информацию. Объявление можно сохранить как черновик и опубликовать позже.</p>
      </header>
      <RecruitmentForm
        error={mutation.error instanceof Error ? mutation.error.message : null}
        initialDraft={initialDraft}
        key={recruitment?.id ?? 'new'}
        onSubmit={(draft, publish) => mutation.mutate({ draft, publish })}
        pending={mutation.isPending}
        status={recruitment?.status}
      />
    </main>
  )
}
