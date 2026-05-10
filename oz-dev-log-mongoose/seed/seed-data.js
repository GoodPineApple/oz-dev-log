/**
 * 데모용 시드 데이터.
 * 두 백엔드(sequelize/mongoose)에서 같은 모양을 사용해 비교가 쉽게 한다.
 *
 * 학습 포인트: 같은 도메인을 두 DB에서 어떻게 표현하는지 비교한다.
 */
import { AttachmentType, CreditType } from "../models/enums.js";

export const SeedUserIds = Object.freeze({
  ALICE: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
  BOB: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
});

export const seedUsers = [
  {
    _id: SeedUserIds.ALICE,
    email: "alice@example.com",
    nickname: "앨리스 (MongoDB)",
    totalCredits: 220,
    createdAt: new Date("2026-05-01T02:00:00.000Z"),
  },
  {
    _id: SeedUserIds.BOB,
    email: "bob@example.com",
    nickname: "밥 (MongoDB)",
    totalCredits: 90,
    createdAt: new Date("2026-05-03T08:30:00.000Z"),
  },
];

export const seedLogs = [
  {
    userId: SeedUserIds.ALICE,
    title: "Mongoose 스키마 잡아두기",
    content:
      "유연한 컬렉션이지만 Mongoose 스키마로 필수 필드와 enum을 강제했다. 임베드 vs 참조도 함께 메모.",
    createdAt: new Date("2026-05-06T10:15:00.000Z"),
  },
  {
    userId: SeedUserIds.ALICE,
    title: "ObjectId와 외부 API의 만남",
    content:
      "ObjectId는 24자 hex 문자열로 직렬화한다. 프론트와의 호환을 위해 응답에서 항상 toString().",
    createdAt: new Date("2026-05-06T14:40:00.000Z"),
  },
  {
    userId: SeedUserIds.BOB,
    title: "관계형 vs 도큐먼트 비교 메모",
    content:
      "JOIN 대신 populate. 트랜잭션은 replica set 필요. 도큐먼트 단위 원자성은 기본 보장.",
    createdAt: new Date("2026-05-07T03:20:00.000Z"),
  },
];

export const seedAttachments = [
  {
    logIndex: 0,
    fileName: "schema-tree.png",
    fileUrl: "https://cdn.example.com/uploads/schema-tree.png",
    fileType: AttachmentType.IMAGE,
    fileSize: 48219,
    createdAt: new Date("2026-05-06T10:16:00.000Z"),
  },
  {
    logIndex: 0,
    fileName: "embed-vs-ref.md",
    fileUrl: "https://cdn.example.com/uploads/embed-vs-ref.md",
    fileType: AttachmentType.FILE,
    fileSize: 2048,
    createdAt: new Date("2026-05-06T10:17:00.000Z"),
  },
  {
    logIndex: 2,
    fileName: "compare.pdf",
    fileUrl: "https://cdn.example.com/uploads/compare.pdf",
    fileType: AttachmentType.FILE,
    fileSize: 156902,
    createdAt: new Date("2026-05-07T03:21:00.000Z"),
  },
];

export const seedCreditTransactions = [
  {
    userId: SeedUserIds.ALICE,
    logIndex: 0,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: new Date("2026-05-06T10:15:01.000Z"),
  },
  {
    userId: SeedUserIds.ALICE,
    logIndex: 0,
    amount: 20,
    type: CreditType.BONUS,
    description: "첨부 파일 보너스",
    createdAt: new Date("2026-05-06T10:15:02.000Z"),
  },
  {
    userId: SeedUserIds.ALICE,
    logIndex: 1,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: new Date("2026-05-06T14:40:01.000Z"),
  },
  {
    userId: SeedUserIds.BOB,
    logIndex: null,
    amount: -10,
    type: CreditType.SPEND,
    description: "테마 스킨 구매",
    createdAt: new Date("2026-05-07T04:00:00.000Z"),
  },
  {
    userId: SeedUserIds.BOB,
    logIndex: 2,
    amount: 100,
    type: CreditType.EARN,
    description: "일지 작성 적립",
    createdAt: new Date("2026-05-07T03:20:01.000Z"),
  },
];
