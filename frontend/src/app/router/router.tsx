import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from '@/app/router/root-layout'
import { RouteLoading } from '@/app/router/route-loading'
import { ProtectedRoute } from '@/features/auth/ui/protected-route'
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
        path: 'events',
        lazy: async () => {
          const { EventsPage } = await import('@/pages/events/ui/events-page')
          return { Component: EventsPage }
        },
      },
      {
        path: 'events/:recruitmentId',
        lazy: async () => {
          const { EventPage } = await import('@/pages/event/ui/event-page')
          return { Component: EventPage }
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
        path: 'card/:cardId',
        lazy: async () => {
          const { PublicCardPage } = await import('@/pages/open-card/ui/open-card-page')
          return { Component: PublicCardPage }
        },
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: 'events/new',
            lazy: async () => {
              const { EditEventPage } = await import('@/pages/edit-event/ui/edit-event-page')
              return { Component: EditEventPage }
            },
          },
          {
            path: 'events/:recruitmentId/edit',
            lazy: async () => {
              const { EditEventPage } = await import('@/pages/edit-event/ui/edit-event-page')
              return { Component: EditEventPage }
            },
          },
          {
            path: 'my-events',
            lazy: async () => {
              const { MyEventsPage } = await import('@/pages/my-events/ui/my-events-page')
              return { Component: MyEventsPage }
            },
          },
          {
            path: 'applications',
            lazy: async () => {
              const { ApplicationsPage } = await import('@/pages/applications/ui/applications-page')
              return { Component: ApplicationsPage }
            },
          },
          {
            path: 'applications/:applicationId/card',
            lazy: async () => {
              const { PublicCardPage } = await import('@/pages/open-card/ui/open-card-page')
              return { Component: PublicCardPage }
            },
          },
          {
            path: 'applications/:recruitmentId',
            lazy: async () => {
              const { RecruitmentApplicationsPage } = await import('@/pages/applications/ui/recruitment-applications-page')
              return { Component: RecruitmentApplicationsPage }
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
            path: 'cards',
            lazy: async () => {
              const { MyCardsPage } = await import(
                '@/pages/my-cards/ui/my-cards-page'
              )
              return { Component: MyCardsPage }
            },
          },
          {
            path: 'cards/:cardId/edit',
            lazy: async () => {
              const { CreateCardPage } = await import(
                '@/pages/create-card/ui/create-card-page'
              )
              return { Component: CreateCardPage }
            },
          },
          {
            path: 'profile',
            lazy: async () => {
              const { ProfilePage } = await import(
                '@/pages/profile/ui/profile-page'
              )
              return { Component: ProfilePage }
            },
          },
        ],
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
