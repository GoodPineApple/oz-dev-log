import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link, useMatch, useNavigate } from 'react-router-dom'
import { createLog, fetchLog, updateLog } from '../api/devlog'
import { MarkdownBody } from '../components/MarkdownBody'
import { AttachmentManager } from '../components/AttachmentManager'
import { useAuthOutlet } from '../hooks/useAuthOutlet'
import { useBackend } from '../hooks/useBackend'
import { useToast } from '../hooks/useToast'

export function LogEditorPage() {
  const newMatch = useMatch({ path: '/logs/new', end: true })
  const editMatch = useMatch({ path: '/logs/:logId/edit', end: true })
  const isNew = Boolean(newMatch)
  const editingLogId = editMatch?.params.logId
    ? decodeURIComponent(editMatch.params.logId)
    : undefined

  const { user } = useAuthOutlet()
  const navigate = useNavigate()
  const { show } = useToast()
  const [backend] = useBackend()
  const qc = useQueryClient()

  const { data: existing, isError: existingError } = useQuery({
    queryKey: ['log', backend, editingLogId],
    queryFn: () => fetchLog(editingLogId!),
    enabled: !isNew && Boolean(editingLogId),
  })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setTitle(existing.title)
      setContent(existing.content)
      setHydrated(true)
    }
  }, [isNew, existing, hydrated])

  useEffect(() => {
    if (!isNew && existingError) {
      show('일지를 찾을 수 없습니다.')
      navigate('/', { replace: true })
    }
  }, [isNew, existingError, navigate, show])

  useEffect(() => {
    if (!isNew && existing && existing.userId !== user.id) {
      show('본인 일지만 수정할 수 있습니다.')
      navigate(`/logs/${encodeURIComponent(existing.id)}`, { replace: true })
    }
  }, [isNew, existing, user.id, navigate, show])

  const createMutation = useMutation({
    mutationFn: () => createLog({ title: title.trim(), content }),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['logs', backend] })
      qc.invalidateQueries({ queryKey: ['me', backend] })
      qc.invalidateQueries({ queryKey: ['user', backend] })
      qc.invalidateQueries({
        queryKey: ['credit-transactions', backend],
      })
      show('일지를 저장했습니다. (+100 CP) 이제 이미지를 첨부할 수 있어요.')
      // 새 일지를 만든 직후엔 첨부 업로드 가능한 수정 페이지로 이동한다.
      navigate(`/logs/${encodeURIComponent(created.id)}/edit`, {
        replace: true,
      })
    },
    onError: (e) => {
      show(e instanceof Error ? e.message : '저장에 실패했습니다.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      updateLog(editingLogId!, {
        title: title.trim(),
        content,
      }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['logs', backend] })
      qc.invalidateQueries({ queryKey: ['log', backend, updated.id] })
      show('일지를 수정했습니다.')
      navigate(`/logs/${encodeURIComponent(updated.id)}`, { replace: true })
    },
    onError: (e) => {
      show(e instanceof Error ? e.message : '수정에 실패했습니다.')
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const previewBody = useMemo(
    () => content || '_내용을 입력하면 여기에 렌더됩니다._',
    [content],
  )

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      show('제목을 입력해 주세요.')
      return
    }
    if (isNew) {
      createMutation.mutate()
    } else {
      updateMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {isNew ? '새 일지' : '일지 수정'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {isNew
            ? '먼저 제목과 본문을 저장하면 이어서 이미지를 첨부할 수 있습니다. 작성 시 자동으로 100 CP가 적립됩니다.'
            : '마크다운으로 작성하고 미리보기로 확인하세요. 이미지는 아래에서 바로 업로드·삭제할 수 있습니다.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            한 줄 요약 (제목)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="예: React Query 캐시 키 설계"
          />
        </div>

        <div className="flex gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              tab === 'write'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            작성
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              tab === 'preview'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            미리보기
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className={tab === 'preview' ? 'hidden lg:block' : ''}>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              본문 (Markdown)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="mt-1 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-sm leading-relaxed text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              placeholder={'## 배운 점\n- …\n\n```ts\nconst x = 1\n```'}
            />
          </div>
          <div className={tab === 'write' ? 'hidden lg:block' : ''}>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              미리보기
            </span>
            <div className="mt-1 min-h-[28rem] rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
              <MarkdownBody markdown={previewBody} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {isPending ? '저장 중…' : isNew ? '저장하고 첨부 추가' : '저장'}
          </button>
          <Link
            to={
              !isNew && editingLogId
                ? `/logs/${encodeURIComponent(editingLogId)}`
                : '/'
            }
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {isNew ? '취소' : '완료'}
          </Link>
        </div>
      </form>

      {!isNew && editingLogId && (
        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <AttachmentManager logId={editingLogId} />
        </div>
      )}
    </div>
  )
}
