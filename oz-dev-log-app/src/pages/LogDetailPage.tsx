import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteLog,
  fetchLog,
  fetchLogAttachments,
} from '../api/devlog'
import { MarkdownBody } from '../components/MarkdownBody'
import { useAuthOutlet } from '../hooks/useAuthOutlet'
import { useBackend } from '../hooks/useBackend'
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
  const [backend] = useBackend()
  const qc = useQueryClient()

  const { data: log, isError, error } = useQuery({
    queryKey: ['log', backend, logId],
    queryFn: () => fetchLog(logId),
    enabled: logId.length > 0,
  })

  const { data: attachments = [] } = useQuery({
    queryKey: ['attachments', backend, logId],
    queryFn: () => fetchLogAttachments(logId),
    enabled: logId.length > 0 && Boolean(log),
  })

  const removeMutation = useMutation({
    mutationFn: () => deleteLog(logId, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logs', backend] })
      qc.invalidateQueries({ queryKey: ['user', backend] })
      show('일지를 삭제했습니다.')
      navigate('/', { replace: true })
    },
    onError: (e) => {
      show(e instanceof Error ? e.message : '삭제에 실패했습니다.')
    },
  })

  if (!logId) {
    return <p className="text-sm text-zinc-500">잘못된 경로입니다.</p>
  }

  if (isError) {
    return (
      <p className="text-sm text-zinc-500">
        {error instanceof Error ? error.message : '일지를 찾을 수 없습니다.'}
      </p>
    )
  }

  if (!log) {
    return <p className="text-sm text-zinc-500">불러오는 중…</p>
  }

  const isMine = log.userId === user.id

  return (
    <article className="space-y-6">
      <div className="text-xs text-zinc-400">{formatWhen(log.createdAt)}</div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {log.title}
      </h1>
      <MarkdownBody markdown={log.content} />
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

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {isMine && (
          <>
            <Link
              to={`/logs/${encodeURIComponent(log.id)}/edit`}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              수정
            </Link>
            <button
              type="button"
              disabled={removeMutation.isPending}
              onClick={() => {
                if (confirm('정말 삭제하시겠습니까?')) {
                  removeMutation.mutate()
                }
              }}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {removeMutation.isPending ? '삭제 중…' : '삭제'}
            </button>
          </>
        )}
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
