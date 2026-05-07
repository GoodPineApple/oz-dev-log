const KEY = 'devlog:userId'

export function getStoredUserId(): string | null {
  try {
    const v = localStorage.getItem(KEY)
    return v && v.length > 0 ? v : null
  } catch {
    return null
  }
}

export function setStoredUserId(userId: string) {
  localStorage.setItem(KEY, userId)
}

export function clearStoredUserId() {
  localStorage.removeItem(KEY)
}
