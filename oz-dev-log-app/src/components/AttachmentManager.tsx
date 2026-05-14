import { useRef, useState, type ChangeEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteAttachment,
  uploadAttachment,
} from '../api/attachments'
import { fetchLogAttachments } from '../api/devlog'
import { useBackend } from '../hooks/useBackend'
import { useToast } from '../hooks/useToast'
import type { Attachment } from '../types'

/**
 * 일지 첨부 관리 — 업로드/삭제 UI.
 *
 * 동작 흐름 (학습용 메모):
 *   1) 사용자가 <input type="file"> 로 이미지 선택
 *   2) FormData 에 담아 POST /logs/:logId/attachments 로 전송
 *   3) 서버: multer → storage → DB 순으로 처리하고 새 Attachment JSON 반환
 *   4) React Query 캐시 무효화 → 목록 재조회 → 새 이미지가 즉시 표시
 */
export function AttachmentManager({ logId }: { logId: string }) {
  const [backend] = useBackend()
  const { show } = useToast()
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploadingNames, setUploadingNames] = useState<string[]>([])

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['attachments', backend, logId],
    queryFn: () => fetchLogAttachments(logId),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(logId, file),
  })

  const removeMutation = useMutation({
    mutationFn: (att: Attachment) => deleteAttachment(logId, att.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', backend, logId] })
      show('첨부를 삭제했습니다.')
    },
    onError: (err) => {
      show(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    },
  })

  async function onPickFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]
    e.target.value = '' // 같은 파일 다시 선택 가능하게 초기화
    if (files.length === 0) return
    setUploadingNames(files.map((f) => f.name))
    try {
      for (const file of files) {
        await uploadMutation.mutateAsync(file)
      }
      qc.invalidateQueries({ queryKey: ['attachments', backend, logId] })
      show(`${files.length}개의 파일을 업로드했습니다.`)
    } catch (err) {
      show(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingNames([])
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          첨부 이미지
        </h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadingNames.length > 0}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {uploadingNames.length > 0 ? '업로드 중…' : '이미지 추가'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPickFiles}
          className="hidden"
        />
      </div>

      {isLoading && (
        <p className="text-xs text-zinc-500">첨부 목록을 불러오는 중…</p>
      )}

      {attachments.length === 0 && uploadingNames.length === 0 && !isLoading && (
        <p className="rounded-xl border border-dashed border-zinc-200 bg-white p-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          첨부된 이미지가 없습니다. 위 버튼으로 추가하세요.
        </p>
      )}

      {(attachments.length > 0 || uploadingNames.length > 0) && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <img
                src={a.fileUrl}
                alt={a.fileName}
                className="block h-40 w-full object-cover"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                <span className="truncate text-zinc-700 dark:text-zinc-300">
                  {a.fileName}
                </span>
                <button
                  type="button"
                  disabled={removeMutation.isPending}
                  onClick={() => {
                    if (confirm(`"${a.fileName}" 을(를) 삭제할까요?`)) {
                      removeMutation.mutate(a)
                    }
                  }}
                  className="rounded-md border border-red-200 px-2 py-0.5 text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
          {uploadingNames.map((name) => (
            <li
              key={`pending-${name}`}
              className="flex h-40 items-center justify-center rounded-xl border border-dashed border-violet-300 bg-violet-50 text-xs text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-200"
            >
              ⏳ {name} 업로드 중…
            </li>
          ))}
        </ul>
      )}

      <p className="rounded-lg bg-zinc-50 px-3 py-2 text-[11px] leading-relaxed text-zinc-500 dark:bg-zinc-900">
        브라우저 → <code className="font-mono">POST /logs/{logId}/attachments</code>{' '}
        (multipart/form-data) → 서버의 multer → Firebase Storage(또는 로컬 디스크) →
        반환된 URL 을 DB 에 저장. 위 이미지는 그 URL 을 직접 가리킵니다.
      </p>
    </section>
  )
}
