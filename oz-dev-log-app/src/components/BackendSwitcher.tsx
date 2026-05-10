import { useNavigate } from 'react-router-dom'
import { BACKEND_LABEL, type Backend } from '../lib/backend'
import { useBackend } from '../hooks/useBackend'
import { clearStoredUserId } from '../lib/auth'

const ORDER: Backend[] = ['sequelize', 'mongoose']

/**
 * 활성 백엔드 토글. 학생들이 같은 화면에서 두 저장소를 비교해 볼 수 있게 한다.
 *
 * 백엔드를 바꾸면 다음 효과가 발생한다:
 *   1) main.tsx의 onBackendChange 핸들러가 React Query 캐시 전체를 비운다.
 *   2) 모든 useQuery는 backend를 queryKey에 포함하므로 새 백엔드로 다시 fetch된다.
 *   3) 두 백엔드는 서로 다른 사용자 풀을 가질 수 있어 로그인 상태를 자동 정리한다.
 */
export function BackendSwitcher() {
  const [backend, setBackend] = useBackend()
  const navigate = useNavigate()

  const onChange = (next: Backend) => {
    if (next === backend) return
    setBackend(next)
    // 사용자/일지가 백엔드별로 다르므로 로그인 상태를 정리하고 다시 고르게 한다.
    clearStoredUserId()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex w-full items-center justify-between gap-3 text-xs">
      <span className="text-zinc-500 dark:text-zinc-400">
        백엔드 (저장소):
      </span>
      <div
        role="radiogroup"
        aria-label="백엔드 선택"
        className="inline-flex rounded-full border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900"
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
