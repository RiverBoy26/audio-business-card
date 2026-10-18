import { afterEach, describe, expect, it, vi } from 'vitest'

import { createVoiceGain, musicPlaybackVolume, voiceGainValue } from '@/shared/lib/audio-volume'

afterEach(() => vi.unstubAllGlobals())

describe('audio volume mapping', () => {
  it('keeps the voice midpoint at normal volume and allows a 200% boost', () => {
    expect(voiceGainValue(100)).toBe(1)
    expect(voiceGainValue(200)).toBe(2)
    expect(voiceGainValue(200, 50)).toBe(1)
  })

  it('caps music at half of its source volume', () => {
    expect(musicPlaybackVolume(100)).toBe(0.5)
    expect(musicPlaybackVolume(50)).toBe(0.25)
    expect(musicPlaybackVolume(100, 50)).toBe(0.25)
  })

  it('sets a gain node above the audio element volume limit', () => {
    const source = { connect: vi.fn(), disconnect: vi.fn() }
    const gain = { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() }
    const context = {
      createMediaElementSource: vi.fn(() => source),
      createGain: vi.fn(() => gain),
      destination: {},
      resume: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
    }
    class MockAudioContext {
      createMediaElementSource = context.createMediaElementSource
      createGain = context.createGain
      destination = context.destination
      resume = context.resume
      close = context.close
    }
    vi.stubGlobal('AudioContext', MockAudioContext)

    const controller = createVoiceGain()
    controller?.attach(document.createElement('audio'))
    controller?.setVolume(2)

    expect(gain.gain.value).toBe(2)
    expect(source.connect).toHaveBeenCalledWith(gain)
    controller?.close()
  })
})
