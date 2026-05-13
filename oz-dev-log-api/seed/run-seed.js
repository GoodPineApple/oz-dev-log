/**
 * 빈 DB일 때만 데모용 데이터를 채워 넣는다.
 * 이미 데이터가 있다면 아무 것도 하지 않는다.
 *
 * 학습 포인트:
 *   - 시드의 평문 비밀번호는 bcrypt 해시로 변환해 저장한다.
 */
import bcrypt from "bcryptjs";
import { sequelize } from "../config/database.js";
import {
  User,
  Log,
  Attachment,
  CreditTransaction,
} from "../models/index.js";
import {
  DEMO_PASSWORD,
  seedUsers,
  seedLogs,
  seedAttachments,
  seedCreditTransactions,
} from "./seed-data.js";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

export async function runSeed() {
  const userCount = await User.count();
  if (userCount > 0) {
    console.log(`[api] 시드 건너뜀 — 이미 ${userCount}명의 사용자가 있음.`);
    return;
  }

  const userRows = await Promise.all(
    seedUsers.map(async (u) => ({
      id: u.id,
      email: u.email,
      nickname: u.nickname,
      passwordHash: await bcrypt.hash(u.password, BCRYPT_ROUNDS),
      totalCredits: u.totalCredits,
      createdAt: u.createdAt,
    })),
  );

  await sequelize.transaction(async (t) => {
    await User.bulkCreate(userRows, { transaction: t });

    const createdLogs = await Log.bulkCreate(seedLogs, {
      transaction: t,
      returning: true,
    });

    const attachmentRows = seedAttachments.map((a) => ({
      logId: createdLogs[a.logIndex].id,
      fileName: a.fileName,
      fileUrl: a.fileUrl,
      fileType: a.fileType,
      fileSize: a.fileSize,
      createdAt: a.createdAt,
    }));
    await Attachment.bulkCreate(attachmentRows, { transaction: t });

    const txRows = seedCreditTransactions.map((tx) => ({
      userId: tx.userId,
      logId: tx.logIndex == null ? null : createdLogs[tx.logIndex].id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      createdAt: tx.createdAt,
    }));
    await CreditTransaction.bulkCreate(txRows, { transaction: t });
  });

  console.log(
    `[api] 시드 데이터 주입 완료. 데모 비밀번호: ${DEMO_PASSWORD}`,
  );
}
