/**
 * 백엔드 응답 타입.
 *
 * 두 백엔드(Sequelize/Mongoose)가 동일한 모양으로 응답하도록 만들어
 * 프론트엔드 코드는 백엔드 종류에 신경 쓰지 않는다.
 *
 * - id 류는 모두 string. (Mongoose의 ObjectId, Sequelize의 INT auto-increment 모두
 *   응답 시 문자열로 직렬화한다.)
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
  userId: string
  title: string
  content: string
}

export type LogUpdateInput = {
  userId: string
  title?: string
  content?: string
}
