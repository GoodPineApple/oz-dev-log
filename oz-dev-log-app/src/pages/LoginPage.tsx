import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { fetchUsers } from '../api/devlog'
import { getStoredUserId, setStoredUserId } from '../lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const existing = getStoredUserId()

  const { data: users, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  if (existing) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-svh bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          DevLog
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          오늘 배운 것을 짧게 남기고, 성장 궤적을 모아보세요.
        </p>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            소셜 로그인 (데모)
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Firebase 연동 전까지는 목업 사용자로 체험할 수 있습니다.
          </p>

          {isLoading && (
            <p className="mt-6 text-sm text-zinc-500">사용자 목록 불러오는 중…</p>
          )}
          {isError && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                API에 연결할 수 없습니다. Express 서버가{' '}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                  localhost:3000
                </code>
                에서 실행 중인지 확인하세요.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                다시 시도
              </button>
            </div>
          )}
          {users && (
            <ul className="mt-6 space-y-2 text-left">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setStoredUserId(u.id)
                      navigate('/', { replace: true })
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-50 dark:border-zinc-700 dark:hover:border-violet-700 dark:hover:bg-violet-950/40"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {u.nickname}
                    </span>
                    <span className="text-xs text-zinc-500">{u.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-[11px] leading-relaxed text-zinc-400">
            실제 서비스에서는 Google 로그인 버튼으로 Firebase Auth에 연결합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
