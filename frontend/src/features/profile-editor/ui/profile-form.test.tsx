import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CurrentUser } from '@/features/auth/model/auth-api'
import { ProfileForm } from '@/features/profile-editor/ui/profile-form'

afterEach(cleanup)

const user: CurrentUser = {
  avatarUrl: null,
  birthDate: '2000-03-14',
  email: 'mark@example.ru',
  firstName: 'Марк',
  id: '78b7801d-3fdb-4070-8a57-7817b57ecb89',
  lastName: 'Соколов',
  middleName: 'Андреевич',
  phone: '+7-900-123-45-67',
  role: 'USER',
}

describe('ProfileForm', () => {
  it('enables editing and submits changed profile data', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ProfileForm onSave={onSave} user={user} />)

    const firstName = screen.getByLabelText('Имя')
    expect(firstName).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Редактировать' }))
    expect(firstName).toBeEnabled()

    fireEvent.change(firstName, { target: { value: 'Маркел' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        birthDate: '2000-03-14',
        email: 'mark@example.ru',
        firstName: 'Маркел',
        lastName: 'Соколов',
        middleName: 'Андреевич',
        phone: '+7-900-123-45-67',
      }),
    )
    expect(await screen.findByText('Изменения сохранены')).toBeInTheDocument()
    expect(firstName).toBeDisabled()
  })

  it('keeps unsaved values after an error and restores them on cancel', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Сервис временно недоступен'))
    render(<ProfileForm onSave={onSave} user={user} />)

    fireEvent.click(screen.getByRole('button', { name: 'Редактировать' }))
    const lastName = screen.getByLabelText('Фамилия')
    fireEvent.change(lastName, { target: { value: 'Петров' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }))

    expect(await screen.findByText('Сервис временно недоступен')).toBeInTheDocument()
    expect(lastName).toHaveValue('Петров')

    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
    expect(lastName).toHaveValue('Соколов')
    expect(lastName).toBeDisabled()
  })
})
