/**
 * API 절대/상대 URL. `VITE_API_BASE_URL`이 비어 있으면 상대 경로만 사용해
 * 개발 시 Vite `server.proxy`로 백엔드에 전달합니다.
 */
export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
  const normalizedBase = base.replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  if (!normalizedBase) return p
  return `${normalizedBase}${p}`
}
