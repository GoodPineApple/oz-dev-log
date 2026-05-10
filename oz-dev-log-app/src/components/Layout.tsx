import { Link, NavLink, Outlet } from 'react-router-dom'
import type { User } from '../types'
import type { AuthOutletContext } from '../hooks/useAuthOutlet'
import { BackendSwitcher } from './BackendSwitcher'

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
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 pb-3">
          <BackendSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Outlet context={{ user } satisfies AuthOutletContext} />
      </main>
      <footer className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
        DevLog · MySQL/MongoDB 비교 학습용
      </footer>
    </div>
  )
}
