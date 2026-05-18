import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      nickname: "Alice",
      passwordHash: hash,
      totalCredits: 300,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      nickname: "Bob",
      passwordHash: hash,
      totalCredits: 100,
    },
  });

  await prisma.log.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: alice.id,
      title: "React Query 캐시 키 설계",
      content:
        "## 배운 점\n- 쿼리 키는 배열로 구성하면 자동 무효화가 편리하다.\n- `invalidateQueries`에 부분 키를 넘기면 하위 키가 모두 무효화된다.\n\n```ts\nuseQuery({ queryKey: ['logs', userId], queryFn: fetchLogs })\n```",
    },
  });

  await prisma.log.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: alice.id,
      title: "JWT 인증 흐름 정리",
      content:
        "## 핵심\n1. 로그인 시 서버가 JWT를 발급한다.\n2. 클라이언트는 `Authorization: Bearer <token>` 헤더를 붙인다.\n3. 서버는 토큰을 검증하고 `req.user`를 세팅한다.",
    },
  });

  await prisma.log.upsert({
    where: { id: 3 },
    update: {},
    create: {
      userId: bob.id,
      title: "Prisma ORM 첫 경험",
      content:
        "## 느낀 점\nSequelize보다 타입 안전성이 훨씬 좋다.\nスキー마 파일 하나로 모델·마이그레이션·타입이 동시에 관리된다.",
    },
  });

  await prisma.creditTransaction.createMany({
    data: [
      {
        userId: alice.id,
        logId: 1,
        amount: 100,
        type: "earn",
        description: "일지 작성 — React Query 캐시 키 설계",
      },
      {
        userId: alice.id,
        logId: 2,
        amount: 100,
        type: "earn",
        description: "일지 작성 — JWT 인증 흐름 정리",
      },
      {
        userId: alice.id,
        amount: 100,
        type: "bonus",
        description: "가입 보너스",
      },
      {
        userId: bob.id,
        logId: 3,
        amount: 100,
        type: "earn",
        description: "일지 작성 — Prisma ORM 첫 경험",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete: alice=%s, bob=%s", alice.id, bob.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
