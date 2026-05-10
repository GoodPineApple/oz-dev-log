/**
 * 빈 DB일 때만 데모용 데이터를 채워 넣는다.
 * 이미 데이터가 있다면 아무 것도 하지 않는다.
 */
import { sequelize } from "../config/database.js";
import {
  User,
  Log,
  Attachment,
  CreditTransaction,
} from "../models/index.js";
import {
  seedUsers,
  seedLogs,
  seedAttachments,
  seedCreditTransactions,
} from "./seed-data.js";

export async function runSeed() {
  const userCount = await User.count();
  if (userCount > 0) {
    console.log(`[sequelize] 시드 건너뜀 — 이미 ${userCount}명의 사용자가 있음.`);
    return;
  }

  await sequelize.transaction(async (t) => {
    await User.bulkCreate(seedUsers, { transaction: t });

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

  console.log("[sequelize] 시드 데이터 주입 완료.");
}
