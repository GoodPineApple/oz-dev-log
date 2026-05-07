import { fetchJson } from './client'
import type { ApiLog, Attachment, CreditTransaction, User } from '../types'

export function fetchUsers() {
  return fetchJson<User[]>('/users')
}

export function fetchUser(userId: string) {
  return fetchJson<User>(`/users/${encodeURIComponent(userId)}`)
}

export function fetchLogs(userId: string) {
  const q = new URLSearchParams({ userId })
  return fetchJson<ApiLog[]>(`/logs?${q}`)
}

export function fetchLog(logId: number) {
  return fetchJson<ApiLog>(`/logs/${logId}`)
}

export function fetchLogAttachments(logId: number) {
  return fetchJson<Attachment[]>(`/logs/${logId}/attachments`)
}

export function fetchCreditTransactions(userId: string) {
  const q = new URLSearchParams({ userId })
  return fetchJson<CreditTransaction[]>(`/credit-transactions?${q}`)
}
