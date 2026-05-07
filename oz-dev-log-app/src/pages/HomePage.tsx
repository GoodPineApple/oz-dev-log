import { useMemo, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchLogs } from '../api/devlog'
import { loadLocalLogs } from '../lib/localLogs'
import { mergeAndSort } from '../lib/mergeLogs'
import { useAuthOutlet } from '../hooks/useAuthOutlet'

const PAGE_SIZE = 8

function formatWhen(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function HomePageInner() {
  const { user } = useAuthOutlet()
  const { data: apiLogs = [], isLoading } = useQuery({
    queryKey: ['logs', user.id],
    queryFn: () => fetchLogs(user.id),
  })

  const [localTick, setLocalTick] = useState(0)
  const localLogs = useMemo(() => {
    void localTick
    return loadLocalLogs(user.id)
  }, [user.id, localTick])

  const merged = useMemo(
    () => mergeAndSort(apiLogs, localLogs),
    [apiLogs, localLogs],
  )

  const [visible, setVisible] = useState(PAGE_SIZE)

  const slice = merged.slice(0, visible)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visible < merged.length) {
          setVisible((v) => Math.min(v + PAGE_SIZE, merged.length))
        }
      },
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [merged.length, visible])

  useEffect(() => {
    const bump = () => setLocalTick((t) => t + 1)
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('devlog:localLogs:')) bump()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('devlog-local-changed', bump)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('devlog-local-changed', bump)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          오늘의 성장
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          최신 일지가 위에 쌓입니다. 스크롤하면 이전 기록을 더 불러옵니다.
        </p>
      </div>

      <Link
        to="/logs/new"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 sm:w-auto"
      >
        오늘의 기록하기
      </Link>

      {isLoading && (
        <p className="text-sm text-zinc-500">일지를 불러오는 중…</p>
      )}

      <ul className="space-y-3">
        {slice.map((log) => (
          <li key={log.id}>
            <Link
              to={`/logs/${encodeURIComponent(log.id)}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400">
                  {formatWhen(log.createdAt)}
                </span>
                {log.source === 'local' && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    이 기기에만 저장
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {log.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {log.content}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {!isLoading && merged.length === 0 && (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          아직 기록이 없습니다. 첫 일지를 남겨보세요.
        </p>
      )}

      <div ref={sentinelRef} className="h-8" aria-hidden />

      {visible < merged.length && (
        <p className="text-center text-xs text-zinc-400">더 불러오는 중…</p>
      )}
    </div>
  )
}

export function HomePage() {
  const { user } = useAuthOutlet()
  return <HomePageInner key={user.id} />
}
