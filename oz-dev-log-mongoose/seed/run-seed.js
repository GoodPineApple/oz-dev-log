/**
 * 빈 DB일 때만 데모용 데이터를 주입.
 */
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
  const userCount = await User.countDocuments({});
  if (userCount > 0) {
    console.log(`[mongoose] 시드 건너뜀 — 이미 ${userCount}명의 사용자가 있음.`);
    return;
  }

  await User.insertMany(seedUsers);

  const logDocs = await Log.insertMany(seedLogs);

  const attachmentDocs = seedAttachments.map((a) => ({
    logId: logDocs[a.logIndex]._id,
    fileName: a.fileName,
    fileUrl: a.fileUrl,
    fileType: a.fileType,
    fileSize: a.fileSize,
    createdAt: a.createdAt,
  }));
  await Attachment.insertMany(attachmentDocs);

  const txDocs = seedCreditTransactions.map((tx) => ({
    userId: tx.userId,
    logId: tx.logIndex == null ? null : logDocs[tx.logIndex]._id,
    amount: tx.amount,
    type: tx.type,
    description: tx.description,
    createdAt: tx.createdAt,
  }));
  await CreditTransaction.insertMany(txDocs);

  console.log("[mongoose] 시드 데이터 주입 완료.");
}
