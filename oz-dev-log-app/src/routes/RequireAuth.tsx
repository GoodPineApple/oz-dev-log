import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  clearAllAuth,
  clearStoredUserId,
  getStoredToken,
  getStoredUserId,
  onTokenChange,
} from '../lib/auth'
import { fetchMe } from '../api/auth'
import { fetchUser } from '../api/devlog'
import { AppLayout } from '../components/Layout'
import { useBackend } from '../hooks/useBackend'
import { backendUsesJwt } from '../lib/backend'

export function RequireAuth() {
  const [backend] = useBackend()
  const navigate = useNavigate()
  const isJwt = backendUsesJwt(backend)

  const token = getStoredToken()
  const pickUserId = getStoredUserId()

  // 토큰이 외부에서 바뀌면(예: client.ts 가 401 시 정리) 강제 리렌더.
  useEffect(() => onTokenChange(() => navigate(0)), [navigate])

  const meQuery = useQuery({
    queryKey: ['me', backend],
    queryFn: fetchMe,
    enabled: isJwt && Boolean(token),
    retry: false,
  })

  const userQuery = useQuery({
    queryKey: ['user', backend, pickUserId],
    queryFn: () => fetchUser(pickUserId!),
    enabled: !isJwt && Boolean(pickUserId),
    retry: false,
  })

  // 로그인 안 됨
  if (isJwt ? !token : !pickUserId) {
    return <Navigate to="/login" replace />
  }

  const query = isJwt ? meQuery : userQuery

  if (query.isError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center text-sm text-zinc-500">
        <p>
          {isJwt
            ? '세션이 만료되었거나 토큰이 유효하지 않습니다. 다시 로그인해 주세요.'
            : '현재 선택한 백엔드에서 사용자를 찾지 못했습니다.'}
        </p>
        <button
          type="button"
          onClick={() => {
            if (isJwt) clearAllAuth()
            else clearStoredUserId()
            navigate('/login', { replace: true })
          }}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          로그인 화면으로
        </button>
      </div>
    )
  }

  if (!query.data) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-zinc-500">
        불러오는 중…
      </div>
    )
  }

  return (
    <AppLayout
      user={query.data}
      onLogout={() => {
        clearAllAuth()
        navigate('/login', { replace: true })
      }}
    />
  )
}
