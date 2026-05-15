import { fetchJson } from './client'
import type {
  ApiLog,
  Attachment,
  CreditTransaction,
  LogCreateInput,
  LogUpdateInput,
  User,
} from '../types'

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

export function fetchLog(logId: string) {
  return fetchJson<ApiLog>(`/logs/${encodeURIComponent(logId)}`)
}

export function fetchLogAttachments(logId: string) {
  return fetchJson<Attachment[]>(
    `/logs/${encodeURIComponent(logId)}/attachments`,
  )
}

export function fetchCreditTransactions(userId: string) {
  const q = new URLSearchParams({ userId })
  return fetchJson<CreditTransaction[]>(`/credit-transactions?${q}`)
}

/**
 * 일지 작성. 작성자(userId)는 서버가 토큰에서 가져오므로 body 에 보내지 않는다.
 */
export function createLog(input: LogCreateInput) {
  return fetchJson<ApiLog>('/logs', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateLog(logId: string, input: LogUpdateInput) {
  return fetchJson<ApiLog>(`/logs/${encodeURIComponent(logId)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteLog(logId: string) {
  // 서버가 204 No Content 로 응답하므로 본문이 없다.
  return fetchJson<void>(`/logs/${encodeURIComponent(logId)}`, {
    method: 'DELETE',
  })
}
