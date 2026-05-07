import { apiUrl } from '../lib/apiBase'

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), init)
  if (!res.ok) {
    let detail: unknown = res.statusText
    try {
      detail = await parseJson(res.clone())
    } catch {
      /* ignore */
    }
    throw new Error(
      typeof detail === 'object' && detail !== null && 'error' in detail
        ? String((detail as { error: string }).error)
        : `요청 실패 (${res.status})`,
    )
  }
  return parseJson<T>(res)
}
