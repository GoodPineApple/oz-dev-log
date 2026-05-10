import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { fetchUsers } from '../api/devlog'
import { getStoredUserId, setStoredUserId } from '../lib/auth'
import { BACKEND_LABEL } from '../lib/backend'
import { useBackend } from '../hooks/useBackend'
import { BackendSwitcher } from '../components/BackendSwitcher'

export function LoginPage() {
  const navigate = useNavigate()
  const existing = getStoredUserId()
  const [backend] = useBackend()

  const { data: users, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['users', backend],
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
          MySQL과 MongoDB, 두 백엔드에 같은 화면이 어떻게 붙는지 비교해 보세요.
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <BackendSwitcher />
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            데모 사용자 선택
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            현재 백엔드: <strong>{BACKEND_LABEL[backend]}</strong>
          </p>

          {isLoading && (
            <p className="mt-6 text-sm text-zinc-500">사용자 목록 불러오는 중…</p>
          )}
          {isError && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error instanceof Error
                  ? error.message
                  : '백엔드에 연결할 수 없습니다.'}
              </p>
              <p className="text-xs text-zinc-500">
                백엔드가 실행 중인지 확인하세요{' '}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                  npm run dev:{backend}
                </code>
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
        </div>
      </div>
    </div>
  )
}
