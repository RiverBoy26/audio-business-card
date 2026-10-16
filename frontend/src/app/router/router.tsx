import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from '@/app/router/root-layout'
import { RouteLoading } from '@/app/router/route-loading'
import { RouteErrorPage } from '@/pages/error/ui/route-error-page'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    HydrateFallback: RouteLoading,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('@/pages/home/ui/home-page')
          return { Component: HomePage }
        },
      },
      {
        path: 'create',
        lazy: async () => {
          const { CreateCardPage } = await import(
            '@/pages/create-card/ui/create-card-page'
          )
          return { Component: CreateCardPage }
        },
      },
      {
        path: 'open',
        lazy: async () => {
          const { OpenCardPage } = await import('@/pages/open-card/ui/open-card-page')
          return { Component: OpenCardPage }
        },
      },
      {
        path: 'cards',
        lazy: async () => {
          const { MyCardsPage } = await import(
            '@/pages/my-cards/ui/my-cards-page'
          )
          return { Component: MyCardsPage }
        },
      },
      {
        path: 'profile',
        lazy: async () => {
          const { ProfilePage } = await import('@/pages/profile/ui/profile-page')
          return { Component: ProfilePage }
        },
      },
      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import(
            '@/pages/not-found/ui/not-found-page'
          )
          return { Component: NotFoundPage }
        },
      },
    ],
  },
])
