/**
 * 데모용 시드 데이터.
 *
 * 학습 포인트(인증):
 *   - 시드 사용자들은 동일한 데모 비밀번호를 가진다 → seed/run-seed.js 가 bcrypt 해시한다.
 *   - DEMO_PASSWORD 를 학생에게 그대로 안내해 로그인을 체험하게 한다.
 */
import { AttachmentType, CreditType } from "../models/enums.js";

export const DEMO_PASSWORD = "password123";

export const SeedUserIds = Object.freeze({
  ALICE: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
  BOB: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
});

export const seedUsers = [
  {
    id: SeedUserIds.ALICE,
    email: "alice@example.com",
    nickname: "앨리스",
    password: DEMO_PASSWORD,
    totalCredits: 220,
    createdAt: "2026-05-01T02:00:00.000Z",
  },
  {
    id: SeedUserIds.BOB,
    email: "bob@example.com",
    nickname: "밥",
    password: DEMO_PASSWORD,
    totalCredits: 90,
    createdAt: "2026-05-03T08:30:00.000Z",
  },
];

export const seedLogs = [
  {
    userId: SeedUserIds.ALICE,
    title: "Sequelize 모델 분리하기",
    content:
      "models/, controllers/, routes/로 디렉터리를 나눴다. SQL 스키마는 모델 파일 한 곳에서만 정의되도록 정리했다.",
    createdAt: "2026-05-06T10:15:00.000Z",
  },
  {
    userId: SeedUserIds.ALICE,
    title: "트랜잭션으로 크레딧 적립 묶기",
    content:
      "일지 작성 + 크레딧 적립을 하나의 트랜잭션에 묶었다. 중간에 실패하면 양쪽이 모두 롤백된다.",
    createdAt: "2026-05-06T14:40:00.000Z",
  },
  {
    userId: SeedUserIds.BOB,
    title: "관계형 vs 도큐먼트 비교 메모",
    content:
      "JOIN을 통한 일대다 조회는 관계형이 직관적이다. 반면 임베드된 데이터를 한 번에 가져오는 건 MongoDB 쪽이 빠르다.",
    createdAt: "2026-05-07T03:20:00.000Z",
  },
];

export const seedAttachments = [
  {
    logIndex: 0,
    fileName: "diagram.png",
    fileUrl: "https://cdn.example.com/uploads/diagram.png",
    fileType: AttachmentType.IMAGE,
    fileSize: 48219,
    createdAt: "2026-05-06T10:16:00.000Z",
  },
  {
    logIndex: 0,
    fileName: "notes.md",
    fileUrl: "https://cdn.example.com/uploads/notes.md",
    fileType: AttachmentType.FILE,
    fileSize: 2048,
    createdAt: "2026-05-06T10:17:00.000Z",
  },
  {
    logIndex: 2,
    fileName: "compare.pdf",
    fileUrl: "https://cdn.example.com/uploads/compare.pdf",
    fileType: AttachmentType.FILE,
    fileSize: 156902,
    createdAt: "2026-05-07T03:21:00.000Z",
  },
];

export const seedCreditTransactions = [
  {
    userId: SeedUserIds.ALICE,
    logIndex: 0,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: "2026-05-06T10:15:01.000Z",
  },
  {
    userId: SeedUserIds.ALICE,
    logIndex: 0,
    amount: 20,
    type: CreditType.BONUS,
    description: "첨부 파일 보너스",
    createdAt: "2026-05-06T10:15:02.000Z",
  },
  {
    userId: SeedUserIds.ALICE,
    logIndex: 1,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: "2026-05-06T14:40:01.000Z",
  },
  {
    userId: SeedUserIds.BOB,
    logIndex: null,
    amount: -10,
    type: CreditType.SPEND,
    description: "테마 스킨 구매",
    createdAt: "2026-05-07T04:00:00.000Z",
  },
  {
    userId: SeedUserIds.BOB,
    logIndex: 2,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: "2026-05-07T03:20:01.000Z",
  },
];
