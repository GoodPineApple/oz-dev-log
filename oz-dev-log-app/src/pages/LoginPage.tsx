import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { fetchUsers } from '../api/devlog'
import { login } from '../api/auth'
import {
  getStoredToken,
  getStoredUserId,
  setStoredToken,
  setStoredUserId,
} from '../lib/auth'
import { BACKEND_LABEL, backendUsesJwt } from '../lib/backend'
import { useBackend } from '../hooks/useBackend'
import { BackendSwitcher } from '../components/BackendSwitcher'

function JwtLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('password123')

  const loginMutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: ({ token }) => {
      setStoredToken(token)
      navigate('/', { replace: true })
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    loginMutation.mutate()
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3 text-left">
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          비밀번호
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {loginMutation.isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : '로그인에 실패했습니다.'}
        </p>
      )}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {loginMutation.isPending ? '로그인 중…' : '로그인'}
      </button>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>계정이 없으세요?</span>
        <Link
          to="/register"
          className="font-medium text-violet-600 dark:text-violet-400"
        >
          회원가입 →
        </Link>
      </div>

      <p className="rounded-lg bg-zinc-50 px-3 py-2 text-[11px] leading-relaxed text-zinc-500 dark:bg-zinc-900">
        데모 계정: <code className="font-mono">alice@example.com</code> 또는{' '}
        <code className="font-mono">bob@example.com</code> /{' '}
        <code className="font-mono">password123</code>
      </p>
    </form>
  )
}

function PickUserLogin() {
  const navigate = useNavigate()
  const [backend] = useBackend()
  const { data: users, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['users', backend],
    queryFn: fetchUsers,
  })

  if (isLoading) {
    return <p className="mt-6 text-sm text-zinc-500">사용자 목록 불러오는 중…</p>
  }
  if (isError) {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error instanceof Error
            ? error.message
            : '백엔드에 연결할 수 없습니다.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          다시 시도
        </button>
      </div>
    )
  }
  return (
    <ul className="mt-6 space-y-2 text-left">
      {users?.map((u) => (
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
  )
}

export function LoginPage() {
  const [backend] = useBackend()
  const isJwt = backendUsesJwt(backend)
  const alreadyAuthed = isJwt ? Boolean(getStoredToken()) : Boolean(getStoredUserId())

  if (alreadyAuthed) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-svh bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          DevLog
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {isJwt
            ? '이메일과 비밀번호로 로그인하세요. 발급된 JWT 는 헤더의 자물쇠 아이콘에서 확인할 수 있습니다.'
            : '비교용 백엔드입니다. 등록된 사용자를 선택해 로그인합니다.'}
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {isJwt ? '로그인' : '데모 사용자 선택'}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            현재 백엔드: <strong>{BACKEND_LABEL[backend]}</strong>
          </p>

          {isJwt ? <JwtLogin /> : <PickUserLogin />}
        </div>

        <details className="mx-auto mt-6 max-w-md rounded-xl border border-dashed border-zinc-200 bg-white/60 p-3 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
          <summary className="cursor-pointer select-none font-medium text-zinc-600 dark:text-zinc-400">
            고급: 백엔드 전환 (수업 비교용)
          </summary>
          <div className="mt-3">
            <BackendSwitcher />
          </div>
        </details>
      </div>
    </div>
  )
}
