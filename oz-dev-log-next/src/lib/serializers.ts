import type { User, Log, Attachment, CreditTransaction } from "@prisma/client";

export function serializeUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    totalCredits: u.totalCredits,
    createdAt: u.createdAt.toISOString(),
  };
}

export function serializeLog(l: Log) {
  return {
    id: l.id,
    userId: l.userId,
    title: l.title,
    content: l.content,
    createdAt: l.createdAt.toISOString(),
  };
}

export function serializeAttachment(a: Attachment) {
  return {
    id: a.id,
    logId: a.logId,
    fileName: a.fileName,
    fileUrl: a.fileUrl,
    fileType: a.fileType,
    fileSize: a.fileSize,
    createdAt: a.createdAt.toISOString(),
  };
}

export function serializeCreditTransaction(t: CreditTransaction) {
  return {
    id: t.id,
    userId: t.userId,
    logId: t.logId,
    amount: t.amount,
    type: t.type,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  };
}
