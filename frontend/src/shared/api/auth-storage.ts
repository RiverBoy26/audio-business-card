const accessTokenKey = 'audio-business-card.access-token'
const refreshTokenKey = 'audio-business-card.refresh-token'

export type StoredTokens = {
  accessToken: string
  refreshToken: string
}

export function getAccessToken() {
  return window.localStorage.getItem(accessTokenKey)
}

export function getRefreshToken() {
  return window.localStorage.getItem(refreshTokenKey)
}

export function saveTokens(tokens: StoredTokens) {
  window.localStorage.setItem(accessTokenKey, tokens.accessToken)
  window.localStorage.setItem(refreshTokenKey, tokens.refreshToken)
}

export function clearTokens() {
  window.localStorage.removeItem(accessTokenKey)
  window.localStorage.removeItem(refreshTokenKey)
}
