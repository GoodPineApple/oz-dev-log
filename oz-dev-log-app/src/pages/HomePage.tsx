import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchLogs } from '../api/devlog'
import { useAuthOutlet } from '../hooks/useAuthOutlet'
import { useBackend } from '../hooks/useBackend'
import { BACKEND_LABEL } from '../lib/backend'

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
  const [backend] = useBackend()
  const { data: logs = [], isLoading, isError, error } = useQuery({
    queryKey: ['logs', backend, user.id],
    queryFn: () => fetchLogs(user.id),
  })

  const [visible, setVisible] = useState(PAGE_SIZE)
  const slice = logs.slice(0, visible)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visible < logs.length) {
          setVisible((v) => Math.min(v + PAGE_SIZE, logs.length))
        }
      },
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [logs.length, visible])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          오늘의 성장
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {BACKEND_LABEL[backend]}에 저장된 일지를 시간 역순으로 보여줍니다.
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

      {isError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error instanceof Error ? error.message : '일지를 불러오지 못했습니다.'}
        </p>
      )}

      <ul className="space-y-3">
        {slice.map((log) => (
          <li key={log.id}>
            <Link
              to={`/logs/${encodeURIComponent(log.id)}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-900"
            >
              <span className="text-xs text-zinc-400">
                {formatWhen(log.createdAt)}
              </span>
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

      {!isLoading && !isError && logs.length === 0 && (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          아직 기록이 없습니다. 첫 일지를 남겨보세요.
        </p>
      )}

      <div ref={sentinelRef} className="h-8" aria-hidden />

      {visible < logs.length && (
        <p className="text-center text-xs text-zinc-400">더 불러오는 중…</p>
      )}
    </div>
  )
}

export function HomePage() {
  const { user } = useAuthOutlet()
  return <HomePageInner key={user.id} />
}
