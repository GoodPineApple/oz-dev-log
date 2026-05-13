import { Link, NavLink, Outlet } from 'react-router-dom'
import type { User } from '../types'
import type { AuthOutletContext } from '../hooks/useAuthOutlet'
import { BackendSwitcher } from './BackendSwitcher'
import { TokenBadge } from './TokenBadge'

export function AppLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100'
        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
    ].join(' ')

  return (
    <div className="min-h-svh bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            DevLog
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              타임라인
            </NavLink>
            <NavLink to="/logs/new" className={linkClass}>
              기록하기
            </NavLink>
            <NavLink to="/me" className={linkClass}>
              마이
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <TokenBadge />
            <span className="hidden max-w-[8rem] truncate text-xs text-zinc-500 sm:inline dark:text-zinc-400">
              {user.nickname}
            </span>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
              {user.totalCredits} CP
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              나가기
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Outlet context={{ user } satisfies AuthOutletContext} />
      </main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-2xl space-y-3 px-4 py-6 text-center text-xs text-zinc-400">
          <details className="mx-auto inline-block max-w-md text-left">
            <summary className="cursor-pointer select-none text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              고급: 백엔드 전환 (수업 비교용)
            </summary>
            <div className="mt-3 rounded-xl border border-dashed border-zinc-200 bg-white/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <BackendSwitcher />
            </div>
          </details>
          <p>DevLog · 인증 학습용 데모</p>
        </div>
      </footer>
    </div>
  )
}
