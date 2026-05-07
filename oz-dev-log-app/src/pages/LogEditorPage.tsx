import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link, useMatch, useNavigate } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { useToast } from '../hooks/useToast'
import { estimateCredits } from '../lib/creditsPreview'
import {
  loadLocalLogs,
  newLocalId,
  upsertLocalLog,
} from '../lib/localLogs'
import { isLocalLogId } from '../lib/mergeLogs'
import type { DevLog } from '../types'
import { useAuthOutlet } from '../hooks/useAuthOutlet'

const MAX_FILES = 5
const MAX_FILE_BYTES = 10 * 1024 * 1024

function todayLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isFirstPostToday(userId: string, excludeId?: string) {
  const t = todayLocal()
  const locals = loadLocalLogs(userId).filter((l) => l.id !== excludeId)
  return !locals.some((l) => l.createdAt.slice(0, 10) === t)
}

export function LogEditorPage() {
  const newMatch = useMatch({ path: '/logs/new', end: true })
  const editMatch = useMatch({ path: '/logs/:logId/edit', end: true })
  const isNew = Boolean(newMatch)
  const decoded = editMatch?.params.logId
    ? decodeURIComponent(editMatch.params.logId)
    : undefined

  const { user } = useAuthOutlet()
  const navigate = useNavigate()
  const { show } = useToast()

  const existingLocal =
    !isNew && decoded && isLocalLogId(decoded)
      ? loadLocalLogs(user.id).find((l) => l.id === decoded)
      : undefined

  const [title, setTitle] = useState(existingLocal?.title ?? '')
  const [content, setContent] = useState(existingLocal?.content ?? '')
  const [tagsRaw, setTagsRaw] = useState(
    existingLocal?.tags.join(', ') ?? '',
  )
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    if (!isNew && decoded && !isLocalLogId(decoded)) {
      show('서버 일지는 아직 이 화면에서 수정할 수 없습니다.')
      navigate(`/logs/${encodeURIComponent(decoded)}`, { replace: true })
    }
  }, [isNew, decoded, navigate, show])

  useEffect(() => {
    if (!isNew && decoded && isLocalLogId(decoded) && !existingLocal) {
      show('로컬 일지를 찾을 수 없습니다.')
      navigate('/', { replace: true })
    }
  }, [isNew, decoded, existingLocal, navigate, show])

  const tags = useMemo(
    () =>
      tagsRaw
        .split(/[,\s]+/)
        .map((s) => s.replace(/^#/, '').trim())
        .filter(Boolean),
    [tagsRaw],
  )

  const previewCredits = useMemo(
    () =>
      estimateCredits({
        hasAttachment:
          files.length > 0 ||
          (existingLocal?.localAttachments?.length ?? 0) > 0,
        contentLength: content.trim().length,
        isFirstPostToday: isFirstPostToday(user.id, existingLocal?.id),
      }),
    [
      content,
      existingLocal?.id,
      existingLocal?.localAttachments?.length,
      files.length,
      user.id,
    ],
  )

  async function readFilesAsAttachments(
    list: File[],
  ): Promise<NonNullable<DevLog['localAttachments']>> {
    const out: NonNullable<DevLog['localAttachments']> = []
    for (const f of list) {
      if (f.size > MAX_FILE_BYTES) {
        throw new Error(`${f.name}은(는) 10MB를 넘을 수 없습니다.`)
      }
      const isImg = /^image\/(png|jpeg|gif)$/i.test(f.type)
      const url = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.onerror = () => reject(new Error('파일을 읽지 못했습니다.'))
        r.readAsDataURL(f)
      })
      out.push({
        type: isImg ? 'image' : 'file',
        name: f.name,
        url,
      })
    }
    return out
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      show('제목을 입력해 주세요.')
      return
    }
    try {
      let localAttachments = existingLocal?.localAttachments
      if (files.length > 0) {
        localAttachments = await readFilesAsAttachments(files)
      }
      const id = existingLocal?.id ?? newLocalId()
      const createdAt = existingLocal?.createdAt ?? new Date().toISOString()
      const log: DevLog = {
        id,
        source: 'local',
        userId: user.id,
        title: title.trim(),
        content,
        tags,
        createdAt,
        localAttachments,
      }
      upsertLocalLog(user.id, log)
      window.dispatchEvent(new Event('devlog-local-changed'))
      const { total, parts } = estimateCredits({
        hasAttachment: (localAttachments?.length ?? 0) > 0,
        contentLength: content.trim().length,
        isFirstPostToday: isFirstPostToday(user.id, existingLocal?.id),
      })
      if (total > 0) {
        show(
          `축하합니다! 약 ${total} CP를 획득한 것으로 가정합니다. (${parts.join(', ')})`,
        )
      } else {
        show('기록을 저장했습니다. (로컬)')
      }
      navigate(`/logs/${encodeURIComponent(id)}`, { replace: true })
    } catch (err) {
      show(err instanceof Error ? err.message : '저장에 실패했습니다.')
    }
  }

  function onFilesPicked(e: ChangeEvent<HTMLInputElement>) {
    const list = [...(e.target.files ?? [])]
    e.target.value = ''
    if (list.length + files.length > MAX_FILES) {
      show(`첨부는 최대 ${MAX_FILES}개까지 가능합니다.`)
      return
    }
    setFiles((prev) => [...prev, ...list])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {!isNew ? '일지 수정' : '새 일지'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          마크다운으로 작성하고 미리보기로 확인하세요. 저장은 우선 이
          브라우저(로컬)에만 반영됩니다.
        </p>
      </div>

      <div className="rounded-xl border border-violet-100 bg-violet-50/80 px-3 py-2 text-xs text-violet-900 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-100">
        예상 크레딧(참고): <strong>{previewCredits.total} CP</strong>
        {previewCredits.parts.length > 0 && (
          <span className="text-violet-700 dark:text-violet-300">
            {' '}
            — {previewCredits.parts.join(' · ')}
          </span>
        )}
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
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            태그 (쉼표로 구분)
          </label>
          <input
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="React, TypeScript"
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
              <MarkdownBody
                markdown={content || '_내용을 입력하면 여기에 렌더됩니다._'}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            첨부 (최대 {MAX_FILES}개, 개당 10MB · png/jpg/gif 및 코드·압축 등)
          </label>
          <input
            type="file"
            multiple
            onChange={onFilesPicked}
            className="mt-2 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white dark:text-zinc-400"
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-zinc-500">
              {files.map((f) => (
                <li key={f.name + f.size}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            저장
          </button>
          <Link
            to={
              !isNew && decoded
                ? `/logs/${encodeURIComponent(decoded)}`
                : '/'
            }
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
