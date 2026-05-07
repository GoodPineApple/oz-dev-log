import { AttachmentType, CreditType } from "./enums.js";
import { createAttachment } from "./Attachment.js";
import { createCreditTransaction } from "./CreditTransaction.js";
import { createLog } from "./Log.js";
import { createUser } from "./User.js";

/** 목업에서 참조할 고정 사용자 UUID */
export const MockUserIds = Object.freeze({
  ALICE: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
  BOB: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
});

/** users — DB 연결 전 시드·테스트용 */
export const mockUsers = Object.freeze([
  createUser({
    id: MockUserIds.ALICE,
    email: "alice@example.com",
    nickname: "앨리스",
    totalCredits: 220,
    createdAt: "2026-05-01T02:00:00.000Z",
  }),
  createUser({
    id: MockUserIds.BOB,
    email: "bob@example.com",
    nickname: "밥",
    totalCredits: 90,
    createdAt: "2026-05-03T08:30:00.000Z",
  }),
]);

/** logs — mockUsers.id 참조 */
export const mockLogs = Object.freeze([
  createLog({
    id: 1,
    userId: MockUserIds.ALICE,
    title: "Express 라우터 구조 정리",
    content:
      "오늘은 /auth, /users, /logs 라우트를 나누고 미들웨어 순서를 점검했다. 다음에는 에러 핸들러를 통일할 예정이다.",
    createdAt: "2026-05-06T10:15:00.000Z",
  }),
  createLog({
    id: 2,
    userId: MockUserIds.ALICE,
    title: "첨부 업로드 용량 제한",
    content:
      "JSON 본문 limit과 멀티파트 설정을 맞춰서 대용량 로그 저장 시 413이 나지 않게 했다.",
    createdAt: "2026-05-06T14:40:00.000Z",
  }),
  createLog({
    id: 3,
    userId: MockUserIds.BOB,
    title: "크레딧 규칙 초안",
    content:
      "일지 1회 적립, 첨부 보너스, 연속 기록 보너스를 표로 정리해 기획과 공유했다.",
    createdAt: "2026-05-07T03:20:00.000Z",
  }),
]);

/** attachments — mockLogs.id 참조 */
export const mockAttachments = Object.freeze([
  createAttachment({
    id: 1,
    logId: 1,
    fileName: "routes-diagram.png",
    fileUrl: "https://cdn.example.com/uploads/routes-diagram.png",
    fileType: AttachmentType.IMAGE,
    fileSize: 48219,
    createdAt: "2026-05-06T10:16:00.000Z",
  }),
  createAttachment({
    id: 2,
    logId: 1,
    fileName: "notes.md",
    fileUrl: "https://cdn.example.com/uploads/notes.md",
    fileType: AttachmentType.FILE,
    fileSize: 2048,
    createdAt: "2026-05-06T10:17:00.000Z",
  }),
  createAttachment({
    id: 3,
    logId: 3,
    fileName: "credit-rules.pdf",
    fileUrl: "https://cdn.example.com/uploads/credit-rules.pdf",
    fileType: AttachmentType.FILE,
    fileSize: 156902,
    createdAt: "2026-05-07T03:21:00.000Z",
  }),
]);

/** credit_transactions — user_id / log_id FK 관계 유지 */
export const mockCreditTransactions = Object.freeze([
  createCreditTransaction({
    id: 1,
    userId: MockUserIds.ALICE,
    logId: 1,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: "2026-05-06T10:15:01.000Z",
  }),
  createCreditTransaction({
    id: 2,
    userId: MockUserIds.ALICE,
    logId: 1,
    amount: 20,
    type: CreditType.BONUS,
    description: "첨부 파일 보너스",
    createdAt: "2026-05-06T10:15:02.000Z",
  }),
  createCreditTransaction({
    id: 3,
    userId: MockUserIds.ALICE,
    logId: 2,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: "2026-05-06T14:40:01.000Z",
  }),
  createCreditTransaction({
    id: 4,
    userId: MockUserIds.BOB,
    logId: null,
    amount: -10,
    type: CreditType.SPEND,
    description: "테마 스킨 구매",
    createdAt: "2026-05-07T04:00:00.000Z",
  }),
  createCreditTransaction({
    id: 5,
    userId: MockUserIds.BOB,
    logId: 3,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: "2026-05-07T03:20:01.000Z",
  }),
]);
