import { apiUrl } from '../lib/apiBase'
import { getBackend, type Backend } from '../lib/backend'

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

async function throwErrorFromResponse(res: Response): Promise<never> {
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

/**
 * 활성 백엔드(또는 명시된 백엔드)에 JSON 요청을 보낸다.
 * 두 백엔드 모두 동일한 응답 스키마를 사용한다.
 */
export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  backend?: Backend,
): Promise<T> {
  const target = backend ?? getBackend()
  const headers: HeadersInit = {
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  }
  const res = await fetch(apiUrl(target, path), { ...init, headers })
  if (!res.ok) await throwErrorFromResponse(res)
  return parseJson<T>(res)
}
