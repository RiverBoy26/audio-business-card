import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthContext, type AuthContextValue } from '@/features/auth/model/use-auth'
import { AuthDialog } from '@/features/auth/ui/auth-dialog'

afterEach(cleanup)

describe('AuthDialog', () => {
  it('requires consent after the repeated password field', () => {
    const auth: AuthContextValue = {
      avatarRevision: 0,
      isReady: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateProfile: vi.fn(),
      uploadAvatar: vi.fn(),
    }

    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth}>
          <AuthDialog mode="register" onClose={vi.fn()} onModeChange={vi.fn()} />
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    const repeatPassword = screen.getByLabelText('Повторите пароль')
    const consent = screen.getByLabelText('Я согласен на обработку персональных данных')

    expect(consent).toBeRequired()
    expect(repeatPassword.compareDocumentPosition(consent) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
