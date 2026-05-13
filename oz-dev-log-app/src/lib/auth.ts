/**
 * 클라이언트 인증 상태 저장소 (localStorage 기반).
 *
 * 두 가지 모드를 함께 다룬다:
 *   - JWT 모드 ('api' 백엔드): `devlog:token` 에 토큰을 저장.
 *     userId 는 토큰의 payload(sub) 에서 디코드해 사용한다.
 *   - 사용자 선택 모드 ('sequelize' / 'mongoose' 비교 백엔드): `devlog:userId` 에 사용자 ID 저장.
 *
 * 학습 포인트:
 *   - localStorage 는 XSS 에 취약하다 (스크립트가 읽고 훔칠 수 있음).
 *     실제 서비스에서는 HttpOnly 쿠키 + CSRF 방어 조합을 고려한다.
 *     이 데모는 토큰 자체를 학생에게 보여주기 위해 localStorage 를 사용한다.
 *   - 토큰 변경 시 'devlog-token-changed' 이벤트로 다른 컴포넌트에 알린다.
 */

const TOKEN_KEY = 'devlog:token'
const USER_ID_KEY = 'devlog:userId'
const TOKEN_EVENT = 'devlog-token-changed'

export function getStoredUserId(): string | null {
  try {
    const v = localStorage.getItem(USER_ID_KEY)
    return v && v.length > 0 ? v : null
  } catch {
    return null
  }
}

export function setStoredUserId(userId: string) {
  localStorage.setItem(USER_ID_KEY, userId)
}

export function clearStoredUserId() {
  localStorage.removeItem(USER_ID_KEY)
}

export function getStoredToken(): string | null {
  try {
    const v = localStorage.getItem(TOKEN_KEY)
    return v && v.length > 0 ? v : null
  } catch {
    return null
  }
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new CustomEvent(TOKEN_EVENT))
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new CustomEvent(TOKEN_EVENT))
}

export function onTokenChange(handler: () => void) {
  window.addEventListener(TOKEN_EVENT, handler)
  return () => window.removeEventListener(TOKEN_EVENT, handler)
}

/** 모든 인증 자취 정리 — 로그아웃이나 백엔드 전환 시 사용. */
export function clearAllAuth() {
  clearStoredToken()
  clearStoredUserId()
}

export type DecodedJwt = {
  raw: string
  header: Record<string, unknown>
  payload: Record<string, unknown> & {
    sub?: string
    iat?: number
    exp?: number
  }
  signature: string
}

function base64UrlDecode(input: string): string {
  // Pad with '=' to multiple of 4, replace url-safe chars.
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  try {
    return decodeURIComponent(
      atob(padded + pad)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
  } catch {
    return atob(padded + pad)
  }
}

/**
 * JWT 를 header / payload / signature 로 분해한다.
 * 서명 검증은 하지 않고(서버만 가능) 표시 목적의 디코드만 한다.
 */
export function decodeJwt(token: string): DecodedJwt | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]))
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    return { raw: token, header, payload, signature: parts[2] }
  } catch {
    return null
  }
}

/** payload.sub (또는 user_id) 에서 userId 를 꺼낸다. */
export function userIdFromToken(token: string | null): string | null {
  if (!token) return null
  const d = decodeJwt(token)
  if (!d) return null
  const sub = d.payload.sub
  return typeof sub === 'string' ? sub : null
}
