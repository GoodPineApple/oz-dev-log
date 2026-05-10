import { Navigate, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { clearStoredUserId, getStoredUserId } from '../lib/auth'
import { fetchUser } from '../api/devlog'
import { AppLayout } from '../components/Layout'
import { useBackend } from '../hooks/useBackend'

export function RequireAuth() {
  const userId = getStoredUserId()
  const navigate = useNavigate()
  const [backend] = useBackend()

  const { data: user, isError } = useQuery({
    queryKey: ['user', backend, userId],
    queryFn: () => fetchUser(userId!),
    enabled: Boolean(userId),
  })

  if (!userId) {
    return <Navigate to="/login" replace />
  }

  if (isError) {
    // 같은 userId가 다른 백엔드에 없을 수 있으므로, 자동 로그아웃은 하지 않고 안내한다.
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center text-sm text-zinc-500">
        <p>
          현재 선택한 백엔드에서 이 사용자를 찾지 못했습니다. 백엔드를 바꾸거나
          다른 사용자로 다시 로그인하세요.
        </p>
        <button
          type="button"
          onClick={() => {
            clearStoredUserId()
            navigate('/login', { replace: true })
          }}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          로그인 화면으로
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-zinc-500">
        불러오는 중…
      </div>
    )
  }

  return (
    <AppLayout
      user={user}
      onLogout={() => {
        clearStoredUserId()
        navigate('/login', { replace: true })
      }}
    />
  )
}
