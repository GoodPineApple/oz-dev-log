/**
 * 활성 백엔드(저장소 종류) 선택 — localStorage에 영구 저장하고
 * 변경 시 'devlog-backend-changed' 이벤트로 알린다.
 *
 * 두 백엔드는 동일한 REST 인터페이스를 갖는다(/users, /logs, /credit-transactions).
 * 차이는 데이터 저장소뿐이다 — Sequelize는 MySQL, Mongoose는 MongoDB.
 */
export type Backend = 'sequelize' | 'mongoose'

const STORAGE_KEY = 'devlog:backend'
const CHANGE_EVENT = 'devlog-backend-changed'

function readEnvDefault(): Backend {
  const raw = import.meta.env.VITE_DEFAULT_BACKEND
  return raw === 'mongoose' ? 'mongoose' : 'sequelize'
}

export function getBackend(): Backend {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'sequelize' || v === 'mongoose') return v
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
  sequelize: 'MySQL · Sequelize',
  mongoose: 'MongoDB · Mongoose',
}
