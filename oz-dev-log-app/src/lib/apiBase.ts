/**
 * 백엔드별 API URL 빌더.
 *
 * - VITE_SEQUELIZE_API_URL / VITE_MONGOOSE_API_URL을 채우면 절대 URL을 호출(프록시 우회).
 * - 비워 두면 Vite 프록시 접두사를 사용한다 (`/sequelize/*`, `/mongoose/*`).
 */
import type { Backend } from './backend'

function envBase(backend: Backend): string {
  const raw =
    backend === 'sequelize'
      ? import.meta.env.VITE_SEQUELIZE_API_URL
      : import.meta.env.VITE_MONGOOSE_API_URL
  return (raw ?? '').trim().replace(/\/+$/, '')
}

export function apiUrl(backend: Backend, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = envBase(backend)
  if (base) return `${base}${p}`
  // 프록시 접두사: /sequelize/users 또는 /mongoose/users
  return `/${backend}${p}`
}
