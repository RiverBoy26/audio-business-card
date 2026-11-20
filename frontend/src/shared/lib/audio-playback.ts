const playbackEvent = 'audio-business-card:playback-start'

export function announcePlayback(owner: string) {
  window.dispatchEvent(new CustomEvent<string>(playbackEvent, { detail: owner }))
}

export function onOtherPlayback(owner: string, stop: () => void) {
  const listener = (event: Event) => {
    if ((event as CustomEvent<string>).detail !== owner) stop()
  }
  window.addEventListener(playbackEvent, listener)
  return () => window.removeEventListener(playbackEvent, listener)
}

export function createPlaybackOwner() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`
}
