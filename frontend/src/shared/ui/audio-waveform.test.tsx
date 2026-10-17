import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AudioWaveform } from '@/shared/ui/audio-waveform'

afterEach(cleanup)

describe('AudioWaveform', () => {
  it('seeks continuously while the pointer is dragged', () => {
    const onSeek = vi.fn()
    render(<AudioWaveform onSeek={onSeek} progress={0} />)
    const slider = screen.getByRole('slider', { name: 'Позиция аудио' })
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      bottom: 40,
      height: 40,
      left: 10,
      right: 210,
      toJSON: () => ({}),
      top: 0,
      width: 200,
      x: 10,
      y: 0,
    })

    fireEvent.pointerDown(slider, { buttons: 1, clientX: 60, pointerId: 1 })
    fireEvent.pointerMove(slider, { buttons: 1, clientX: 160, pointerId: 1 })

    expect(onSeek).toHaveBeenNthCalledWith(1, 0.25)
    expect(onSeek).toHaveBeenNthCalledWith(2, 0.75)
  })

  it('supports keyboard seeking', () => {
    const onSeek = vi.fn()
    render(<AudioWaveform onSeek={onSeek} progress={0.5} />)
    const slider = screen.getByRole('slider', { name: 'Позиция аудио' })

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    fireEvent.keyDown(slider, { key: 'Home' })

    expect(onSeek).toHaveBeenNthCalledWith(1, 0.55)
    expect(onSeek).toHaveBeenNthCalledWith(2, 0)
  })
})
