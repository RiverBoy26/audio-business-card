export function normalizeDuration(value: number, fallback = 0) {
  if (Number.isFinite(value) && value > 0) return value
  return Number.isFinite(fallback) && fallback > 0 ? fallback : 0
}

export function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.floor(normalizeDuration(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
