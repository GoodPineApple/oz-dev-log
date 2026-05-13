import { apiUrl } from '../lib/apiBase'
import { getStoredToken, clearStoredToken } from '../lib/auth'
import { backendUsesJwt, getBackend, type Backend } from '../lib/backend'

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function throwErrorFromResponse(res: Response): Promise<never> {
  let detail: unknown = res.statusText
  try {
    detail = await parseJson(res.clone())
  } catch {
    /* ignore */
  }
  const msg =
    typeof detail === 'object' && detail !== null && 'error' in detail
      ? String((detail as { error: string }).error)
      : `요청 실패 (${res.status})`
  throw new ApiError(msg, res.status)
}

/**
 * 활성 백엔드(또는 명시된 백엔드)에 JSON 요청을 보낸다.
 *
 * 인증 흐름(JWT 백엔드일 때):
 *   1) localStorage 의 토큰을 꺼내 `Authorization: Bearer <token>` 으로 부착한다.
 *   2) 401 이 오면 저장된 토큰이 만료/무효라는 신호 — 깨끗이 정리한다.
 *      (라우터의 RequireAuth 가 /login 으로 보낸다)
 */
export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  backend?: Backend,
): Promise<T> {
  const target = backend ?? getBackend()
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (backendUsesJwt(target)) {
    const token = getStoredToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(apiUrl(target, path), { ...init, headers })
  if (!res.ok) {
    if (res.status === 401 && backendUsesJwt(target)) {
      clearStoredToken()
    }
    await throwErrorFromResponse(res)
  }
  return parseJson<T>(res)
}
