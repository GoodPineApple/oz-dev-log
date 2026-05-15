import { fetchJson } from './client'
import type { Attachment } from '../types'

/**
 * 첨부 업로드 — multipart/form-data 로 POST.
 *
 * 핵심:
 *   - FormData 에 'file' 필드명을 사용 (서버의 multer.single("file") 과 일치).
 *   - body 가 FormData 이므로 client.ts 는 Content-Type 을 건드리지 않는다.
 *     브라우저가 boundary 포함한 헤더를 자동으로 붙인다.
 *   - 응답은 새로 생성된 Attachment 한 건의 JSON.
 */
export function uploadAttachment(logId: string, file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return fetchJson<Attachment>(
    `/logs/${encodeURIComponent(logId)}/attachments`,
    {
      method: 'POST',
      body: fd,
    },
  )
}

export function deleteAttachment(logId: string, attachmentId: string) {
  // 서버가 204 No Content 로 응답하므로 본문이 없다.
  return fetchJson<void>(
    `/logs/${encodeURIComponent(logId)}/attachments/${encodeURIComponent(attachmentId)}`,
    { method: 'DELETE' },
  )
}
