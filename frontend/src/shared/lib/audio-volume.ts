export function voiceGainValue(voiceVolume: number, overallVolume = 100) {
  return Math.min(2, Math.max(0, voiceVolume / 100 * overallVolume / 100))
}

export function musicPlaybackVolume(musicVolume: number, overallVolume = 100) {
  return Math.min(0.5, Math.max(0, musicVolume / 200 * overallVolume / 100))
}

export type VoiceGain = {
  attach: (audio: HTMLAudioElement) => void
  close: () => void
  resume: () => void
  setVolume: (volume: number) => void
}

export function createVoiceGain(): VoiceGain | null {
  if (typeof AudioContext === 'undefined') return null

  let context: AudioContext
  try {
    context = new AudioContext()
  } catch {
    return null
  }
  let source: MediaElementAudioSourceNode | null = null
  let gain: GainNode | null = null

  return {
    attach(audio) {
      source = context.createMediaElementSource(audio)
      gain = context.createGain()
      source.connect(gain)
      gain.connect(context.destination)
    },
    close() {
      source?.disconnect()
      gain?.disconnect()
      void context.close().catch(() => undefined)
    },
    resume() {
      void context.resume().catch(() => undefined)
    },
    setVolume(volume) {
      if (gain) gain.gain.value = volume
    },
  }
}
