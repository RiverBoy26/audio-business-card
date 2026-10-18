import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RootLayout } from '@/app/router/root-layout'
import { AuthContext, type AuthContextValue } from '@/features/auth/model/use-auth'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('RootLayout', () => {
  it('returns to the home page after signing out', () => {
    vi.stubGlobal('scrollTo', vi.fn())
    const logout = vi.fn(async () => {})
    const auth: AuthContextValue = {
      avatarRevision: 0,
      isReady: true,
      user: {
        id: 'acb7d748-69f5-4492-9501-c69713146d56',
        firstName: 'Марк',
        lastName: 'Соколов',
        middleName: null,
        birthDate: '2000-01-01',
        email: 'mark@example.com',
        phone: '+79001234567',
        role: 'USER',
        avatarUrl: null,
      },
      login: vi.fn(),
      logout,
      register: vi.fn(),
      updateProfile: vi.fn(),
      uploadAvatar: vi.fn(),
    }
    const router = createMemoryRouter([
      {
        path: '/',
        Component: RootLayout,
        children: [
          { index: true, element: <p>Главная страница</p> },
          { path: 'profile', element: <p>Профиль</p> },
        ],
      },
    ], { initialEntries: ['/profile'] })

    render(<AuthContext.Provider value={auth}><RouterProvider router={router} /></AuthContext.Provider>)
    fireEvent.click(screen.getByRole('button', { name: /Марк/ }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Выйти' }))

    expect(logout).toHaveBeenCalledOnce()
    expect(router.state.location.pathname).toBe('/')
    expect(screen.getByText('Главная страница')).toBeInTheDocument()
  })
})
