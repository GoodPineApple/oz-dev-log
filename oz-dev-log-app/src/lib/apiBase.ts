/**
 * 백엔드별 API URL 빌더.
 *
 * - VITE_API_URL / VITE_SEQUELIZE_API_URL / VITE_MONGOOSE_API_URL 을 채우면
 *   해당 URL을 그대로 호출(브라우저 직접 요청, 백엔드 CORS 허용 필요).
 * - 비워 두면 Vite 프록시 접두사를 사용한다: `/api/*`, `/sequelize/*`, `/mongoose/*`.
 */
import type { Backend } from './backend'

function envBase(backend: Backend): string {
  let raw: string | undefined
  if (backend === 'api') raw = import.meta.env.VITE_API_URL
  else if (backend === 'sequelize') raw = import.meta.env.VITE_SEQUELIZE_API_URL
  else raw = import.meta.env.VITE_MONGOOSE_API_URL
  return (raw ?? '').trim().replace(/\/+$/, '')
}

export function apiUrl(backend: Backend, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = envBase(backend)
  if (base) return `${base}${p}`
  return `/${backend}${p}`
}
