import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchLog, fetchLogAttachments } from '../api/devlog'
import { MarkdownBody } from '../components/MarkdownBody'
import { loadLocalLogs, removeLocalLog } from '../lib/localLogs'
import { apiLogToDev, isLocalLogId } from '../lib/mergeLogs'
import { useAuthOutlet } from '../hooks/useAuthOutlet'
import { useToast } from '../hooks/useToast'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

export function LogDetailPage() {
  const { logId: rawId } = useParams()
  const logId = rawId ? decodeURIComponent(rawId) : ''
  const { user } = useAuthOutlet()
  const navigate = useNavigate()
  const { show } = useToast()

  const local = isLocalLogId(logId)
    ? loadLocalLogs(user.id).find((l) => l.id === logId)
    : undefined

  const numericId = !local && /^\d+$/.test(logId) ? Number(logId) : NaN

  const { data: apiLog, isError } = useQuery({
    queryKey: ['log', numericId],
    queryFn: () => fetchLog(numericId),
    enabled: !local && Number.isInteger(numericId),
  })

  const { data: attachments = [] } = useQuery({
    queryKey: ['attachments', numericId],
    queryFn: () => fetchLogAttachments(numericId),
    enabled: !local && Number.isInteger(numericId) && Boolean(apiLog),
  })

  if (!logId) {
    return <p className="text-sm text-zinc-500">잘못된 경로입니다.</p>
  }

  if (local) {
    return (
      <article className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span>{formatWhen(local.createdAt)}</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            이 기기에만 저장
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {local.title}
        </h1>
        {local.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {local.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
        <MarkdownBody markdown={local.content} />
        {local.localAttachments && local.localAttachments.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              첨부
            </h2>
            <ul className="mt-2 space-y-2">
              {local.localAttachments.map((a) => (
                <li key={a.url}>
                  {a.type === 'image' ? (
                    <img
                      src={a.url}
                      alt={a.name}
                      className="max-h-64 rounded-xl border border-zinc-200 object-contain dark:border-zinc-700"
                    />
                  ) : (
                    <a
                      href={a.url}
                      download={a.name}
                      className="text-sm text-violet-600 underline dark:text-violet-400"
                    >
                      {a.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Link
            to={`/logs/${encodeURIComponent(local.id)}/edit`}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            수정
          </Link>
          <button
            type="button"
            onClick={() => {
              removeLocalLog(user.id, local.id)
              window.dispatchEvent(new Event('devlog-local-changed'))
              show('로컬 일지를 삭제했습니다.')
              navigate('/', { replace: true })
            }}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            삭제
          </button>
          <Link
            to="/"
            className="ml-auto text-sm text-violet-600 dark:text-violet-400"
          >
            ← 목록
          </Link>
        </div>
      </article>
    )
  }

  if (!Number.isInteger(numericId)) {
    return <p className="text-sm text-zinc-500">일지를 찾을 수 없습니다.</p>
  }

  if (isError || !apiLog) {
    return <p className="text-sm text-zinc-500">일지를 찾을 수 없습니다.</p>
  }

  if (apiLog.userId !== user.id) {
    return <p className="text-sm text-zinc-500">접근할 수 없는 일지입니다.</p>
  }

  const dev = apiLogToDev(apiLog)

  return (
    <article className="space-y-6">
      <div className="text-xs text-zinc-400">{formatWhen(dev.createdAt)}</div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {dev.title}
      </h1>
      <MarkdownBody markdown={dev.content} />
      {attachments.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            첨부
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {attachments.map((a) =>
              a.fileType === 'image' ? (
                <li key={a.id}>
                  <a href={a.fileUrl} target="_blank" rel="noreferrer">
                    <img
                      src={a.fileUrl}
                      alt={a.fileName}
                      className="max-h-56 w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
                    />
                  </a>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {a.fileName}
                  </p>
                </li>
              ) : (
                <li key={a.id}>
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-violet-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-violet-300"
                  >
                    <span className="text-lg" aria-hidden>
                      📄
                    </span>
                    <span className="truncate font-medium">{a.fileName}</span>
                  </a>
                </li>
              ),
            )}
          </ul>
        </section>
      )}
      <p className="rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        서버에 저장된 일지입니다. 수정·삭제 API가 준비되면 이 화면에서 바로
        관리할 수 있습니다.
      </p>
      <Link
        to="/"
        className="inline-block text-sm text-violet-600 dark:text-violet-400"
      >
        ← 목록으로
      </Link>
    </article>
  )
}
