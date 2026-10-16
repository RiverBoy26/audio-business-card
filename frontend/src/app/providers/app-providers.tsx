import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'

import { AuthProvider } from '@/features/auth/model/auth-provider'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status =
            typeof error === 'object' && error !== null && 'status' in error
              ? Number(error.status)
              : undefined

          return status !== undefined && status < 500 ? false : failureCount < 2
        },
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  })
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
