/**
 * 활성 백엔드 선택 — localStorage 에 영구 저장하고
 * 변경 시 'devlog-backend-changed' 이벤트로 알린다.
 *
 * 백엔드는 세 가지가 있다:
 *   - 'api'        — 메인 백엔드 (MySQL + Sequelize + JWT 인증). 이번 수업의 주 대상.
 *   - 'sequelize'  — 이전 수업의 비교용 백엔드 (MySQL + Sequelize, 인증 없음).
 *   - 'mongoose'   — 이전 수업의 비교용 백엔드 (MongoDB + Mongoose, 인증 없음).
 *
 * 'api' 는 JWT 토큰을 발급/요구한다. 나머지 둘은 토큰 없이 user-pick 으로 로그인한다.
 */
export type Backend = 'api' | 'sequelize' | 'mongoose'

const STORAGE_KEY = 'devlog:backend'
const CHANGE_EVENT = 'devlog-backend-changed'

function readEnvDefault(): Backend {
  const raw = import.meta.env.VITE_DEFAULT_BACKEND
  if (raw === 'sequelize' || raw === 'mongoose' || raw === 'api') return raw
  return 'api'
}

export function getBackend(): Backend {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'api' || v === 'sequelize' || v === 'mongoose') return v
  } catch {
    /* ignore */
  }
  return readEnvDefault()
}

export function setBackend(next: Backend) {
  const prev = getBackend()
  if (prev === next) return
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent<Backend>(CHANGE_EVENT, { detail: next }),
  )
}

export function onBackendChange(handler: (next: Backend) => void) {
  const wrapped = (e: Event) => {
    const detail = (e as CustomEvent<Backend>).detail
    handler(detail ?? getBackend())
  }
  window.addEventListener(CHANGE_EVENT, wrapped)
  return () => window.removeEventListener(CHANGE_EVENT, wrapped)
}

export const BACKEND_LABEL: Record<Backend, string> = {
  api: 'API (JWT 인증)',
  sequelize: 'MySQL · Sequelize',
  mongoose: 'MongoDB · Mongoose',
}

/** 이 백엔드가 JWT 기반 인증을 사용하는지 */
export function backendUsesJwt(backend: Backend): boolean {
  return backend === 'api'
}
