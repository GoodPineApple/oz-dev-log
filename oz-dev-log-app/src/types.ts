export type User = {
  id: string
  email: string
  nickname: string
  totalCredits: number
  createdAt: string
}

export type ApiLog = {
  id: number
  userId: string
  title: string
  content: string
  createdAt: string
}

export type Attachment = {
  id: number
  logId: number
  fileName: string
  fileUrl: string
  fileType: 'image' | 'file'
  fileSize: number
  createdAt: string
}

export type CreditTransaction = {
  id: number
  userId: string
  logId: number | null
  amount: number
  type: 'earn' | 'spend' | 'bonus' | 'adjust'
  description: string | null
  createdAt: string
}

/** API 일지 + 로컬-only 일지 통합 표현 */
export type DevLog = {
  id: string
  source: 'api' | 'local'
  userId: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  /** 로컬 일지에만 존재할 수 있는 미리보기용 첨부 */
  localAttachments?: { type: 'image' | 'file'; name: string; url: string }[]
}
