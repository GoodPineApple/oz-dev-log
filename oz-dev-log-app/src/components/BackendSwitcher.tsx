import { useNavigate } from 'react-router-dom'
import { BACKEND_LABEL, type Backend } from '../lib/backend'
import { useBackend } from '../hooks/useBackend'
import { clearAllAuth } from '../lib/auth'

const ORDER: Backend[] = ['api', 'sequelize', 'mongoose']

/**
 * 활성 백엔드 토글.
 *   - 'api': 메인 백엔드 (JWT 인증) — 기본값
 *   - 'sequelize'/'mongoose': 이전 수업의 비교용 백엔드 (user-pick 로그인)
 *
 * 전환 시 React Query 캐시는 main.tsx 의 핸들러가 비우고, 여기서는 인증 상태를
 * 초기화한 뒤 로그인 화면으로 이동시킨다 — 백엔드마다 사용자 풀이 다르기 때문.
 */
export function BackendSwitcher() {
  const [backend, setBackend] = useBackend()
  const navigate = useNavigate()

  const onChange = (next: Backend) => {
    if (next === backend) return
    setBackend(next)
    clearAllAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
      <span className="text-zinc-500 dark:text-zinc-400">
        백엔드 (저장소):
      </span>
      <div
        role="radiogroup"
        aria-label="백엔드 선택"
        className="inline-flex flex-wrap justify-end rounded-full border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {ORDER.map((b) => {
          const active = b === backend
          return (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(b)}
              className={[
                'rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                active
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
              ].join(' ')}
            >
              {BACKEND_LABEL[b]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
