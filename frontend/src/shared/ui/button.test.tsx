import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/shared/ui/button'

describe('Button', () => {
  it('supports a native disabled state', () => {
    render(<Button disabled>Создать</Button>)

    expect(screen.getByRole('button', { name: 'Создать' })).toBeDisabled()
  })
})
