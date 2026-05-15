import { apiUrl } from '../lib/apiBase'
import { getStoredToken, clearStoredToken } from '../lib/auth'
import { backendUsesJwt, getBackend, type Backend } from '../lib/backend'

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

/**
 * 백엔드 표준 에러 응답:
 *   { error: { code, message, status, details? } }
 *
 * code 를 캐치해 두면 화면에서 케이스별 분기가 가능해진다 — 예:
 *   if (err instanceof ApiError && err.code === 'EMAIL_TAKEN') { ... }
 */
export class ApiError extends Error {
  status: number
  code: string
  constructor(message: string, status: number, code: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

type ApiErrorBody = {
  error?: {
    code?: string
    message?: string
    status?: number
  }
}

async function throwErrorFromResponse(res: Response): Promise<never> {
  let body: ApiErrorBody | null = null
  try {
    body = await parseJson<ApiErrorBody>(res.clone())
  } catch {
    /* JSON 이 아니거나 빈 본문이면 아래에서 기본값으로 처리 */
  }
  const message =
    body?.error?.message ?? res.statusText ?? `요청 실패 (${res.status})`
  const code = body?.error?.code ?? 'UNKNOWN'
  throw new ApiError(message, res.status, code)
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
  // FormData(멀티파트) 요청은 브라우저가 boundary 를 포함한 Content-Type 을
  // 자동으로 붙여 준다. 우리가 application/json 으로 덮으면 multer 가 파싱하지 못한다.
  if (
    init?.body &&
    typeof init.body === 'string' &&
    !headers.has('Content-Type')
  ) {
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
