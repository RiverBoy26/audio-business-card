import { z } from 'zod'

import { apiRequest } from '@/shared/api/api-client'

const stackSuggestionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  aliases: z.array(z.string()),
})

export type StackSuggestion = z.infer<typeof stackSuggestionSchema>

export function getStackSuggestions() {
  return apiRequest<StackSuggestion[]>('/stacks', {
    schema: z.array(stackSuggestionSchema),
  })
}
