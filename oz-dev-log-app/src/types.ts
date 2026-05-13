/**
 * 백엔드 응답 타입.
 * 세 백엔드(api/sequelize/mongoose) 모두 동일한 모양으로 응답한다.
 * 모든 id 류는 문자열.
 */

export type User = {
  id: string
  email: string
  nickname: string
  totalCredits: number
  createdAt: string
}

export type ApiLog = {
  id: string
  userId: string
  title: string
  content: string
  createdAt: string
}

export type Attachment = {
  id: string
  logId: string
  fileName: string
  fileUrl: string
  fileType: 'image' | 'file'
  fileSize: number
  createdAt: string
}

export type CreditTransaction = {
  id: string
  userId: string
  logId: string | null
  amount: number
  type: 'earn' | 'spend' | 'bonus' | 'adjust'
  description: string | null
  createdAt: string
}

export type LogCreateInput = {
  title: string
  content: string
}

export type LogUpdateInput = {
  title?: string
  content?: string
}

export type AuthCredentials = {
  email: string
  password: string
}

export type RegisterInput = AuthCredentials & {
  nickname: string
}

export type AuthResponse = {
  user: User
  token: string
}
