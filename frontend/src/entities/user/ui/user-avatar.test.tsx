import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { UserAvatar } from '@/entities/user/ui/user-avatar'

afterEach(cleanup)

describe('UserAvatar', () => {
  it('shows initials when the user has no avatar', () => {
    const { container } = render(
      <UserAvatar
        avatarUrl={null}
        firstName="Марк"
        lastName="Соколов"
      />,
    )

    expect(within(container).getByText('МС')).toBeInTheDocument()
  })

  it('falls back to initials when the image cannot be loaded', () => {
    const { container } = render(
      <UserAvatar
        alt="Аватар"
        avatarUrl="/missing-avatar.jpg"
        firstName="Марк"
        lastName="Соколов"
      />,
    )

    fireEvent.error(screen.getByRole('img', { name: 'Аватар' }))

    expect(screen.queryByRole('img', { name: 'Аватар' })).not.toBeInTheDocument()
    expect(within(container).getByText('МС')).toBeInTheDocument()
  })
})
