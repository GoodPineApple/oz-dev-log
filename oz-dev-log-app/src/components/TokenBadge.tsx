import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { decodeJwt, getStoredToken, onTokenChange } from '../lib/auth'
import { useBackend } from '../hooks/useBackend'
import { backendUsesJwt } from '../lib/backend'

/**
 * 헤더에 표시되는 작은 JWT 상태 배지.
 * 클릭하면 /token 인스펙터로 이동한다.
 */
export function TokenBadge() {
  const [backend] = useBackend()
  const [token, setToken] = useState<string | null>(getStoredToken())
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => onTokenChange(() => setToken(getStoredToken())), [])

  useEffect(() => {
    const id = window.setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    )
    return () => window.clearInterval(id)
  }, [])

  const decoded = useMemo(() => (token ? decodeJwt(token) : null), [token])

  if (!backendUsesJwt(backend) || !token || !decoded) {
    return null
  }

  const exp = typeof decoded.payload.exp === 'number' ? decoded.payload.exp : 0
  const remaining = Math.max(0, exp - now)
  const expired = remaining <= 0
  const min = Math.floor(remaining / 60)
  const sec = remaining % 60
  const label = expired ? '만료' : `${min}:${String(sec).padStart(2, '0')}`

  return (
    <Link
      to="/token"
      title="JWT 인스펙터 열기"
      className={
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono font-semibold transition-colors ' +
        (expired
          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300'
          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200')
      }
    >
      <span aria-hidden>🔑</span>
      <span>{label}</span>
    </Link>
  )
}
