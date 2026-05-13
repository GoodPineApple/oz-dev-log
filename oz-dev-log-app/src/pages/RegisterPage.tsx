import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { getStoredToken, setStoredToken } from '../lib/auth'
import { backendUsesJwt } from '../lib/backend'
import { useBackend } from '../hooks/useBackend'

export function RegisterPage() {
  const navigate = useNavigate()
  const [backend] = useBackend()

  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')

  const registerMutation = useMutation({
    mutationFn: () => register({ email, nickname, password }),
    onSuccess: ({ token }) => {
      setStoredToken(token)
      navigate('/', { replace: true })
    },
  })

  if (!backendUsesJwt(backend)) {
    // 비교용 백엔드에는 회원가입이 없다 — 로그인으로 돌려보낸다.
    return <Navigate to="/login" replace />
  }
  if (getStoredToken()) {
    return <Navigate to="/" replace />
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    registerMutation.mutate()
  }

  return (
    <div className="min-h-svh bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          DevLog 회원가입
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          가입과 동시에 JWT 가 발급되어 자동 로그인됩니다.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
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
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              minLength={1}
              maxLength={80}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              비밀번호 (6자 이상)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {registerMutation.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {registerMutation.error instanceof Error
                ? registerMutation.error.message
                : '회원가입에 실패했습니다.'}
            </p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {registerMutation.isPending ? '가입 중…' : '회원가입'}
          </button>

          <p className="text-center text-xs text-zinc-500">
            이미 계정이 있으세요?{' '}
            <Link
              to="/login"
              className="font-medium text-violet-600 dark:text-violet-400"
            >
              로그인
            </Link>
          </p>
        </form>

        <p className="mt-6 rounded-xl bg-zinc-100 px-3 py-2 text-left text-[11px] leading-relaxed text-zinc-500 dark:bg-zinc-900">
          서버는 비밀번호를 평문으로 저장하지 않습니다. bcrypt 로 해시한 뒤,{' '}
          <code className="font-mono">password_hash</code> 컬럼에만 저장합니다.
          로그인 시에는 입력 비밀번호와 저장된 해시를 <code>bcrypt.compare</code>
          로 비교합니다.
        </p>
      </div>
    </div>
  )
}
