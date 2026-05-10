/**
 * Mongoose 도큐먼트를 프론트(JSON)로 변환.
 * - id 필드는 항상 문자열 (ObjectId.toString() 또는 _id 그대로).
 * - 날짜는 ISO 8601 문자열.
 */

function toIso(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function plain(doc) {
  return typeof doc.toObject === "function" ? doc.toObject() : doc;
}

export function serializeUser(doc) {
  if (doc == null) return null;
  const u = plain(doc);
  return {
    id: String(u._id),
    email: u.email,
    nickname: u.nickname,
    totalCredits: Number(u.totalCredits ?? 0),
    createdAt: toIso(u.createdAt),
  };
}

export function serializeLog(doc) {
  if (doc == null) return null;
  const l = plain(doc);
  return {
    id: String(l._id),
    userId: String(l.userId),
    title: l.title,
    content: l.content,
    createdAt: toIso(l.createdAt),
  };
}

export function serializeAttachment(doc) {
  if (doc == null) return null;
  const a = plain(doc);
  return {
    id: String(a._id),
    logId: String(a.logId),
    fileName: a.fileName,
    fileUrl: a.fileUrl,
    fileType: a.fileType,
    fileSize: Number(a.fileSize ?? 0),
    createdAt: toIso(a.createdAt),
  };
}

export function serializeCreditTransaction(doc) {
  if (doc == null) return null;
  const t = plain(doc);
  return {
    id: String(t._id),
    userId: String(t.userId),
    logId: t.logId == null ? null : String(t.logId),
    amount: Number(t.amount),
    type: t.type,
    description: t.description ?? null,
    createdAt: toIso(t.createdAt),
  };
}
