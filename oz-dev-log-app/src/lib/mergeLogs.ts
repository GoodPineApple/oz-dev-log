import type { ApiLog, DevLog } from '../types'

export function apiLogToDev(log: ApiLog): DevLog {
  return {
    id: String(log.id),
    source: 'api',
    userId: log.userId,
    title: log.title,
    content: log.content,
    tags: [],
    createdAt: log.createdAt,
  }
}

export function mergeAndSort(apiLogs: ApiLog[], local: DevLog[]): DevLog[] {
  const fromApi = apiLogs.map(apiLogToDev)
  const merged = [...fromApi, ...local]
  merged.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return merged
}

export function isLocalLogId(id: string) {
  return id.startsWith('local-')
}
