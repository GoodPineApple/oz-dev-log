import type { DevLog } from '../types'

const prefix = 'devlog:localLogs:'

function key(userId: string) {
  return `${prefix}${userId}`
}

export function loadLocalLogs(userId: string): DevLog[] {
  try {
    const raw = localStorage.getItem(key(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as DevLog[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x) =>
        x &&
        typeof x === 'object' &&
        x.source === 'local' &&
        typeof x.id === 'string' &&
        x.userId === userId,
    )
  } catch {
    return []
  }
}

export function saveLocalLogs(userId: string, logs: DevLog[]) {
  const only = logs.filter((l) => l.source === 'local' && l.userId === userId)
  localStorage.setItem(key(userId), JSON.stringify(only))
}

export function upsertLocalLog(userId: string, log: DevLog) {
  const cur = loadLocalLogs(userId).filter((l) => l.id !== log.id)
  cur.push(log)
  saveLocalLogs(userId, cur)
}

export function removeLocalLog(userId: string, logId: string) {
  const cur = loadLocalLogs(userId).filter((l) => l.id !== logId)
  saveLocalLogs(userId, cur)
}

export function newLocalId() {
  return `local-${crypto.randomUUID()}`
}
